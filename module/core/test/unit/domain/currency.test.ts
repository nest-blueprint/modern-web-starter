import { Currency } from '../../../src/domain/currency';
import { CurrencyCode } from '../../../src/domain/currency-code';

describe('[Core/Domain] Currency', () => {
  test('should create a currency', () => {
    const currencyCode = new CurrencyCode('EUR');
    const currency = new Currency(currencyCode);
    expect(currency).toBeInstanceOf(Currency);
  });

  test('instantiation should fail with every invalid argument provided', () => {
    expect(() => new Currency(null)).toThrow();
    expect(() => new Currency(new CurrencyCode('USD'))).toThrow();
  });

  test('allowedCurrenciesNames', () => {
    expect(Currency.allowedCurrenciesNames).toContain('Euro');
  });
});
