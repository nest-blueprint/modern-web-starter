import { Id as UserId } from '../../../src/domain/user/id';
import { Id as PersonId } from '../../../src/domain/person/id';
import { Person } from '../../../src/domain/person';
import { PhoneNumber } from '../../../src/domain/person/phone-number';
import { LinkedinProfileUrl } from '../../../src/infrastructure/type/linkedin-profile-url.type';

describe('[Core/Domain] Person', () => {
  test('should create a person', () => {
    const personId = PersonId.create();
    const userId = UserId.create();
    const phoneNumber = PhoneNumber.fromString('+33699999999');
    const linkedin = new LinkedinProfileUrl('https://www.linkedin.com/in/jean-michel');
    const person = new Person(personId, userId, 'John', 'Doe', phoneNumber, 'J.Doe', linkedin);

    expect(person).toBeInstanceOf(Person);
  });

  test('instantiation should fail with every invalid argument provided', () => {
    const personId = PersonId.create();
    const userId = UserId.create();

    expect(() => new Person(personId, undefined, 'John')).toThrow();
    expect(() => new Person(undefined, userId, 'John')).toThrow();
    // @ts-expect-error - testing instantiation with invalid argument
    expect(() => new Person(personId, userId, 'John', {})).toThrow();

    // @ts-expect-error - testing instantiation with invalid argument
    expect(() => new Person(personId, userId, 'John', 'Doe', 'invalid')).toThrow();
    // @ts-expect-error - testing instantiation with invalid argument
    expect(() => new Person(personId, userId, 'John', 'Doe', undefined, {})).toThrow();

    // @ts-expect-error - testing instantiation with invalid argument
    expect(() => new Person(personId, userId, 'John', 'Doe', undefined, undefined, {})).toThrow();
  });
});
