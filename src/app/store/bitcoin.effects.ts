import { inject, Injectable } from '@angular/core';
import { Actions, ROOT_EFFECTS_INIT, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BitcoinActions } from './bitcoin.actions';
import { PriceService, FiatCurrency } from '../services/price.service';
import { catchError, filter, interval, map, mergeMap, of, switchMap, withLatestFrom } from 'rxjs';
import { selectLastUpdatedFor } from './bitcoin.selectors';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class BitcoinEffects {

  private actions$ = inject(Actions);
  private store = inject(Store);
  private api = inject(PriceService);

  // Start background refresh every minute after effects init
  startPolling$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      switchMap(() => interval(60000)),
      mergeMap(() => [
        BitcoinActions.loadPrice({ currency: 'eur' }),
        BitcoinActions.loadPrice({ currency: 'usd' })
      ])
    )
  );

  // On load request, only call API if lastUpdated older than 60s
  loadPrice$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BitcoinActions.loadPrice),
      withLatestFrom(
        this.store.select(selectLastUpdatedFor('eur')),
        this.store.select(selectLastUpdatedFor('usd')),
      ),
      filter(([action, eurLast, usdLast]) => {
        const now = Date.now();
        const last = action.currency === 'eur' ? eurLast : usdLast;
        return now - last >= 60000 || last === 0; // ensure max once per minute
      }),
      mergeMap(([{ currency }]) => this.fetchCurrency(currency))
    )
  );

  // Also trigger an immediate initial fetch for both currencies on init
  initialFetch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      mergeMap(() => [
        BitcoinActions.loadPrice({ currency: 'eur' }),
        BitcoinActions.loadPrice({ currency: 'usd' })
      ])
    )
  );

  private fetchCurrency(currency: FiatCurrency) {
    const timestamp = Date.now();
    return this.api.fetchBtcPrice(currency).pipe(
      map((price) => BitcoinActions.loadPriceSuccess({ currency, price, timestamp })),
      catchError((err: unknown) => {
        let message = 'Failed to load price';
        const anyErr = err as any;
        // Detect HTTP 429
        if (anyErr && typeof anyErr === 'object') {
          const httpErr = anyErr as HttpErrorResponse;
          const codeFromBody = (httpErr as any)?.error?.status?.error_code;
          if (httpErr?.status === 429 || codeFromBody === 429) {
            message = "You've exceeded the rate limit. Please try again later.";
          }
        }
        // Detect service marker
        if (typeof (anyErr?.message) === 'string' && anyErr.message.includes('RATE_LIMIT')) {
          message = "You've exceeded the rate limit. Please try again later.";
        }
        return of(BitcoinActions.loadPriceFailure({ currency, error: message, timestamp }));
      })
    );
  }
}
