import {createFeature, createReducer, on} from '@ngrx/store';
import {BitcoinActions} from './bitcoin.actions';
import {FiatCurrency} from '../services/price.service';

export interface BitcoinState {
  prices: Partial<Record<FiatCurrency, number>>;
  lastUpdated: Partial<Record<FiatCurrency, number>>; // epoch ms
  loading: Partial<Record<FiatCurrency, boolean>>;
  error: Partial<Record<FiatCurrency, string | undefined>>;
}

const initialState: BitcoinState = {
  prices: {},
  lastUpdated: {},
  loading: {},
  error: {}
};

export const bitcoinFeature = createFeature({
  name: 'bitcoin',
  reducer: createReducer(
    initialState,
    on(BitcoinActions.loadPrice, (state, {currency}) => ({
      ...state,
      loading: {...state.loading, [currency]: true},
      error: {...state.error, [currency]: undefined}
    })),
    on(BitcoinActions.loadPriceSuccess, (state, {currency, price, timestamp}) => ({
      ...state,
      prices: {...state.prices, [currency]: price},
      lastUpdated: {...state.lastUpdated, [currency]: timestamp},
      loading: {...state.loading, [currency]: false},
      error: {...state.error, [currency]: undefined}
    })),
    on(BitcoinActions.loadPriceFailure, (state, {currency, error, timestamp}) => ({
      ...state,
      lastUpdated: {...state.lastUpdated, [currency]: timestamp},
      loading: {...state.loading, [currency]: false},
      error: {...state.error, [currency]: error}
    })),
  )
});

export const {
  name: bitcoinFeatureKey,
  reducer: bitcoinReducer
} = bitcoinFeature;
