import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {FiatCurrency} from '../services/price.service';

export const BitcoinActions = createActionGroup({
  source: 'Bitcoin',
  events: {
    'Load Price': props<{ currency: FiatCurrency }>(),
    'Load Price Success': props<{ currency: FiatCurrency; price: number; timestamp: number }>(),
    'Load Price Failure': props<{ currency: FiatCurrency; error: string; timestamp: number }>(),
  }
});

export const AppActions = createActionGroup({
  source: 'App',
  events: {
    Init: emptyProps(),
  }
});
