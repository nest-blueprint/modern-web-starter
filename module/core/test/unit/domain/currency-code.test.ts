import { CurrencyCode } from '../../../src/domain/currency-code';

describe('[Core/Domain] CurrencyCode', () => {
  test('should create a currency code', () => {
    const currencyCode = new CurrencyCode('EUR');
    expect(currencyCode).toBeInstanceOf(CurrencyCode);
  });

  test('instantiation should fail with every invalid argument provided', () => {
    expect(() => new CurrencyCode(null)).toThrow();
    expect(() => new CurrencyCode('USD')).toThrow();
  });

  test('allowedCurrencyCodes', () => {
    expect(CurrencyCode.allowedCurrencyCodes).toContain('EUR');
  });

  test('fromString()', () => {
    expect(CurrencyCode.fromString('EUR')).toBeInstanceOf(CurrencyCode);
  });

  test('values()', () => {
    expect(CurrencyCode.values()).toContain('EUR');
  });

  test('EURCurrencyCode()', () => {
    expect(CurrencyCode.EURCurrencyCode()).toBeInstanceOf(CurrencyCode);
  });
});
