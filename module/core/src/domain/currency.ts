import { Currency as CurrencyType } from '../infrastructure/type/money/currency';
import { CurrencyCode } from './currency-code';
import { code } from 'currency-codes';
import assert from 'assert';

export class Currency extends CurrencyType {
  static allowedCurrenciesNames = [...CurrencyCode.allowedCurrencyCodes.map((c) => code(c).currency)];
  constructor(_value: CurrencyCode) {
    assert(_value instanceof CurrencyCode, 'Must be an currency code (from domain)');
    super(_value);
  }

  static default(): Currency {
    const str = CurrencyCode.allowedCurrencyCodes[0];
    const allowedCurrencyCode = CurrencyCode.fromString(str);
    return new Currency(allowedCurrencyCode);
  }
}
