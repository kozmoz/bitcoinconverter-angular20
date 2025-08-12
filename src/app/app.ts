import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {selectErrorFor, selectLastUpdatedFor, selectPriceFor} from './store/bitcoin.selectors';
import {BitcoinActions} from './store/bitcoin.actions';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = signal<string>('Angular App');
  amount = signal(1);
  currency = signal<'eur' | 'usd'>('eur');
  direction = signal<'btc-to-fiat' | 'fiat-to-btc'>('btc-to-fiat');
  private store = inject(Store);
  priceEur$: Observable<number | null> = this.store.select(selectPriceFor('eur'));
  priceUsd$: Observable<number | null> = this.store.select(selectPriceFor('usd'));

  lastUpdatedEur$: Observable<number> = this.store.select(selectLastUpdatedFor('eur'));
  lastUpdatedUsd$: Observable<number> = this.store.select(selectLastUpdatedFor('usd'));

  errorEur$: Observable<string | undefined> = this.store.select(selectErrorFor('eur'));
  errorUsd$: Observable<string | undefined> = this.store.select(selectErrorFor('usd'));

  onCurrencyChange(value: 'eur' | 'usd') {
    this.currency.set(value);
    this.store.dispatch(BitcoinActions.loadPrice({currency: value}));
  }
}
