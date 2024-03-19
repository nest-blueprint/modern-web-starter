import { Amount } from './money/amount';
import { Currency } from '../../domain/currency';
import { CurrencyCode } from './money/currency-code';

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

  static fromString(amount: number, currencyCode: string): Money {
    const currencyCodeObject = CurrencyCode.fromString(currencyCode);
    const amountObject = new Amount(amount);
    const currencyObject = new Currency(currencyCodeObject);
    return new Money(amountObject, currencyObject);
  }
}
