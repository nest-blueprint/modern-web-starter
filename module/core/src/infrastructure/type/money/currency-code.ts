import { codes } from 'currency-codes';
import assert from 'assert';
import { InvalidValueProvidedException } from '../../exception/invalid-value-provided.exception';

export class CurrencyCode {
  static currencyCodes = codes();
  public constructor(protected readonly _value: string) {
    Object.freeze(this);
  }

  get value() {
    return this._value;
  }

  static fromString(currencyCode: string) {
    assert(
      codes().includes(currencyCode),
      new InvalidValueProvidedException(`${currencyCode} is not a valid currency code`),
    );
    return new CurrencyCode(currencyCode);
  }
}
