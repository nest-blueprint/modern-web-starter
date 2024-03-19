import { CurrencyCode as CurrencyType } from '../infrastructure/type/money/currency-code';
import assert from 'assert';

export class CurrencyCode extends CurrencyType {
  static allowedCurrencyCodes = ['EUR'];
  constructor(_value: string) {
    assert(CurrencyCode.allowedCurrencyCodes.includes(_value), 'invalid currency code');
    super(_value);
  }

  static EUR = 'EUR';

  static EURCurrencyCode() {
    return new CurrencyCode(CurrencyCode.EUR);
  }

  static fromString(currencyCode: string) {
    return new CurrencyCode(currencyCode);
  }

  static values() {
    return this.allowedCurrencyCodes;
  }
}
