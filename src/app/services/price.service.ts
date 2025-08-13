import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';

export type FiatCurrency = 'eur' | 'usd';

@Injectable({providedIn: 'root'})
export class PriceService {
  private readonly endpoints: Record<FiatCurrency, string> = {
    eur: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur',
    usd: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
  };

  constructor(private http: HttpClient) {
  }

  fetchBtcPrice(currency: FiatCurrency): Observable<number> {
    const url = this.endpoints[currency];
    return this.http.get<any>(url).pipe(
      map((res) => {
        // Handle potential rate-limit body: { status: { error_code: 429, ... } }
        if (res?.status?.error_code === 429) {
          throw new Error('RATE_LIMIT');
        }
        // Expecting shape: { bitcoin: { eur|usd: number } }
        const value = res?.bitcoin?.[currency];
        if (typeof value !== 'number') {
          throw new Error('Invalid response from price API');
        }
        return value;
      })
    );
  }
}
