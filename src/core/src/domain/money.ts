import { Amount } from '../infrastructure/type/money/amount';
import { Currency } from './currency';

import { CurrencyCode } from './currency-code';

export class Money {
  constructor(private readonly _amount: Amount, private readonly _currency: Currency) {
    Object.freeze(this);
  }

  get amount() {
    return this._amount;
  }

  get currency() {
    return this._currency;
  }

  static fromStringValues(amount: number, currencyCode?: string): Money {
    const amountObject = new Amount(amount);
    if (!currencyCode) {
      return new Money(amountObject, Currency.default());
    } else {
      const currencyCodeObject = CurrencyCode.fromString(currencyCode);
      const currencyObject = new Currency(currencyCodeObject);
      return new Money(amountObject, currencyObject);
    }
  }
}
