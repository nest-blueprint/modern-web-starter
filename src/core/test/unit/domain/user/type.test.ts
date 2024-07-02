import { Type } from '../../../../src/domain/user/type';

describe('[Core/Domain/User] Role', () => {
  test('should create a user role', () => {
    const role = new Type(Type.Mentor);
    const role2 = new Type(Type.Customer);
    expect(role).toBeInstanceOf(Type);
    expect(role2).toBeInstanceOf(Type);
  });

  test('instantiation should fail with every invalid argument provided', () => {
    expect(() => new Type(undefined)).toThrow();

    // @ts-expect-error - testing instantiation with invalid argument
    expect(() => new Type('invalid')).toThrow();
  });

  test('equals()', () => {
    const role = new Type(Type.Mentor);
    const role2 = new Type(Type.Mentor);
    const role3 = new Type(Type.Customer);
    expect(role.equals(role2)).toBe(true);
    expect(role3.equals(role3)).toBe(true);
    expect(role.equals(role3)).toBe(false);
  });

  test('values()', () => {
    expect(Type.values().includes(Type.Mentor)).toBe(true);
    expect(Type.values().includes(Type.Customer)).toBe(true);
    expect(Type.values().length).toBe(2);
  });

  test('fromString()', () => {
    expect(Type.fromString(Type.Mentor)).toEqual(new Type(Type.Mentor));
    expect(Type.fromString(Type.Customer)).toEqual(new Type(Type.Customer));
  });

  test('get value()', () => {
    const role = new Type(Type.Mentor);
    expect(role.value).toEqual(Type.Mentor);
  });
});
