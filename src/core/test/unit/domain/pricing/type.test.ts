import { Type as PricingType } from '../../../../src/domain/pricing/type';

describe('[Core/Domain] PricingType', () => {
  test('should create a pricing type object', () => {
    const daily = new PricingType(PricingType.Daily);
    const hourly = new PricingType(PricingType.Hourly);
    expect(daily).toBeInstanceOf(PricingType);
    expect(hourly).toBeInstanceOf(PricingType);
  });

  test('instantiation should fail with every invalid argument provided', () => {
    expect(() => new PricingType(undefined)).toThrow();

    // @ts-expect-error - testing instantiation with invalid argument
    expect(() => new PricingType('invalid')).toThrow();
  });

  test('equals()', () => {
    const daily = new PricingType(PricingType.Daily);
    const daily1 = new PricingType(PricingType.Daily);
    const hourly = new PricingType(PricingType.Hourly);
    expect(daily.equals(daily)).toBe(true);
    expect(daily.equals(daily1)).toBe(true);
    expect(hourly.equals(daily)).toBe(false);
  });

  test('values()', () => {
    expect(PricingType.values().includes(PricingType.Daily)).toBe(true);
    expect(PricingType.values().includes(PricingType.Hourly)).toBe(true);
    expect(PricingType.values().length).toBe(2);
  });

  test('fromString()', () => {
    expect(PricingType.fromString(PricingType.Daily)).toEqual(new PricingType(PricingType.Daily));
    expect(PricingType.fromString(PricingType.Hourly)).toEqual(new PricingType(PricingType.Hourly));
  });

  test('get value()', () => {
    const pricingType = new PricingType(PricingType.Daily);
    expect(pricingType.value).toEqual(PricingType.Daily);
  });
});
