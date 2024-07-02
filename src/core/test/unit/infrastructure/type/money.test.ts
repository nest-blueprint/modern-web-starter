import { Money } from '../../../../src/infrastructure/type/money.type';

describe(' [Core/Infrastructure] MoneyType Object', () => {
  test('Initialization with incorrect values', () => {
    expect(() => Money.fromString(-1, 'EUR')).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => Money.fromRawValues(100, '€')).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => Money.fromRawValues(100, 'eur')).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => Money.fromRawValues(55.4, 'EUR')).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => Money.fromRawValues(150, 'EURO')).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => Money.fromRawValues(150, '')).toThrow();
    expect(() => Money.fromString(0, 'EUR')).toThrow();
  });
  test('Initialization with correct values', () => {
    expect(() => Money.fromString(150, 'EUR')).toBeDefined();
    expect(() => Money.fromString(300, 'USD')).toBeDefined();
  });
});
