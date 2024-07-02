import { Email } from '../../../../src/domain/user/email';

describe('[Core/Domain/User] Email', () => {
  test('should create a user email', () => {
    const email = new Email('john.doe@example.com');
    expect(email).toBeInstanceOf(Email);
    expect(email.value).toEqual('john.doe@example.com');
  });

  test('instantiation should fail with every invalid argument provided', () => {
    expect(() => new Email(undefined)).toThrow();
    expect(() => new Email('invalid')).toThrow();
  });
});
