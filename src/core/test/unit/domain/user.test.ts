import { Id as UserId } from '../../../src/domain/user/id';
import { Id as PersonId } from '../../../src/domain/person/id';
import { Email } from '../../../src/domain/user/email';
import { Type } from '../../../src/domain/user/type';
import { User } from '../../../src/domain/user';
import { Person } from '../../../src/domain/person';

describe('[Core/Domain] User', () => {
  test('should create a user', () => {
    const userId = UserId.create();
    const email = new Email('john.doe@example.com');
    const role = new Type(Type.Customer);

    const user = new User(userId, email, role);

    expect(user).toBeInstanceOf(User);
  });

  test('should create a user with a person', () => {
    const userId = UserId.create();
    const email = new Email('john.doe@example.com');
    const role = new Type(Type.Customer);

    const personId = PersonId.create();

    const person = new Person(personId, userId, 'John');

    const user = new User(userId, email, role, person);

    expect(user).toBeInstanceOf(User);
    expect(user.person).toBeInstanceOf(Person);
  });

  test('instantiation should fail with every invalid argument provided', () => {
    const userId = UserId.create();
    const email = new Email('john.doe@example.com');
    const role = new Type(Type.Customer);

    expect(() => new User(userId, email, undefined)).toThrow();
    expect(() => new User(userId, undefined, role)).toThrow();
    expect(() => new User(undefined, email, role)).toThrow();
    // @ts-expect-error - testing instantiation with invalid argument
    expect(() => new User(userId, email, role, {})).toThrow();
  });
});
