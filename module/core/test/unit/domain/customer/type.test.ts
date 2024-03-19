import { Type as CustomerType } from '../../../../src/domain/customer/type';

describe('[Core/Domain/Customer] CustomerType', () => {
  test('should create a user role', () => {
    const role = new CustomerType(CustomerType.Company);
    const role2 = new CustomerType(CustomerType.School);
    const role3 = new CustomerType(CustomerType.Individual);
    expect([role, role2, role3].every((role) => role instanceof CustomerType)).toBe(true);
  });

  test('instantiation should fail with every invalid argument provided', () => {
    expect(() => new CustomerType(undefined)).toThrow();

    // @ts-expect-error - testing instantiation with invalid argument
    expect(() => new CustomerType('invalid')).toThrow();
  });

  test('equals()', () => {
    const role = new CustomerType(CustomerType.Company);
    const role2 = new CustomerType(CustomerType.School);
    const role3 = new CustomerType(CustomerType.Individual);
    const role4 = new CustomerType(CustomerType.Individual);
    expect(role.equals(role)).toBe(true);
    expect(role.equals(role2)).toBe(false);
    expect(role3.equals(role4)).toBe(true);
  });

  test('values()', () => {
    expect(CustomerType.values().includes(CustomerType.Company)).toBe(true);
    expect(CustomerType.values().includes(CustomerType.School)).toBe(true);
    expect(CustomerType.values().includes(CustomerType.Individual)).toBe(true);
    expect(CustomerType.values().length).toBe(3);
  });

  test('fromString()', () => {
    expect(CustomerType.fromString(CustomerType.Company)).toEqual(new CustomerType(CustomerType.Company));
    expect(CustomerType.fromString(CustomerType.School)).toEqual(new CustomerType(CustomerType.School));
    expect(CustomerType.fromString(CustomerType.Individual)).toEqual(new CustomerType(CustomerType.Individual));
  });

  test('get value()', () => {
    const role = new CustomerType(CustomerType.School);
    expect(role.value).toEqual(CustomerType.School);
  });
});
