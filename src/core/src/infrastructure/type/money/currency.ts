import { CurrencyCode } from './currency-code';
import { code, data } from 'currency-codes';

export class Currency {
  static currencies = [...data.map((currency) => Currency.fromString(currency.code))];
  constructor(protected readonly _value: CurrencyCode) {
    Object.freeze(this);
  }

  get code() {
    return this._value.value;
  }

  static fromString(currencyCode: string) {
    return new Currency(CurrencyCode.fromString(currencyCode));
  }

  static details(currency: Currency) {
    //Retrive the currency details from the currency-codes library
    return code(currency.code);
  }
}
