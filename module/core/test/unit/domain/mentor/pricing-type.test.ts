import { Type as PricingType } from '../../../../src/domain/pricing/type';
describe('[Core/Domain/Mentor] PricingType', () => {
  test('Initialization with incorrect values', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => new PricingType('foo')).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => new PricingType('HOURLY')).toThrow();
  });

  test('Initialization with correct values ', () => {
    expect(new PricingType('hourly')).toBeDefined();
    expect(new PricingType('daily')).toBeDefined();
    expect(new PricingType(PricingType.Hourly)).toBeDefined();
    expect(new PricingType(PricingType.Daily)).toBeDefined();
  });

  test('equals()', () => {
    const hourly1 = new PricingType(PricingType.Hourly);
    const hourly2 = new PricingType(PricingType.Hourly);
    const daily1 = new PricingType(PricingType.Daily);
    const daily2 = new PricingType(PricingType.Daily);

    expect(hourly1.equals(hourly1)).toBeTruthy();
    expect(hourly1.equals(hourly2)).toBeTruthy();
    expect(daily1.equals(daily2)).toBeTruthy();
    expect(daily1.equals(hourly2)).toBeFalsy();

    expect(hourly1.equals('HOURLY')).toBeFalsy();
    expect(hourly1.equals(null)).toBeFalsy();
    expect(hourly1.equals({})).toBeFalsy();
  });

  test('get value()', () => {
    const hourly = new PricingType(PricingType.Hourly);
    expect(hourly.value).toEqual(PricingType.Hourly);
  });

  test('fromString()', () => {
    expect(PricingType.fromString(PricingType.Hourly)).toEqual(new PricingType(PricingType.Hourly));
    expect(PricingType.fromString(PricingType.Daily)).toEqual(new PricingType(PricingType.Daily));
  });

  test('values()', () => {
    expect(PricingType.values().includes(PricingType.Daily)).toBeTruthy();
    expect(PricingType.values().includes(PricingType.Daily)).toBeTruthy();
    expect(PricingType.values().length).toBe(2);
  });
});
