import { Amount } from '../../../../../src/infrastructure/type/money/amount';

describe('Amount object', () => {
  test('Initialialization with incorrect values', () => {
    expect(() => new Amount(-10)).toThrow();
    expect(() => new Amount(-0)).toThrow();
    expect(() => new Amount(0)).toThrow();
    expect(() => new Amount(27.4)).toThrow();
    expect(() => new Amount(NaN)).toThrow();
    expect(() => new Amount(Infinity)).toThrow();
  });
  test('Initialialization with correct values', () => {
    expect(new Amount(10)).toBeDefined();
    expect(new Amount(5)).toBeDefined();
    expect(new Amount(4865848)).toBeDefined();
  });
});
