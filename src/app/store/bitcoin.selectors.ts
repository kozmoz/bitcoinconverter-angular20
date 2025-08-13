import {createSelector} from '@ngrx/store';
import {bitcoinFeature} from './bitcoin.reducer';
import {FiatCurrency} from '../services/price.service';

export const selectPriceFor = (currency: FiatCurrency) =>
  createSelector(bitcoinFeature.selectPrices, (prices) => prices[currency] ?? null);

export const selectLastUpdatedFor = (currency: FiatCurrency) =>
  createSelector(bitcoinFeature.selectLastUpdated, (last) => last[currency] ?? 0);

export const selectErrorFor = (currency: FiatCurrency) =>
  createSelector(bitcoinFeature.selectError, (errors) => errors[currency] ?? undefined);

export const selectIsStaleFor = (currency: FiatCurrency, maxAgeMs = 60000) =>
  createSelector(selectLastUpdatedFor(currency), (last) => Date.now() - last >= maxAgeMs);
