import { Id as UserId } from '../../../src/domain/user/id';
import { Id as CustomerId } from '../../../src/domain/customer/id';
import { Id as MentorId } from '../../../src/domain/mentor/id';
import { Customer } from '../../../src/domain/customer';
import { Type as CustomerType } from '../../../src/domain/customer/type';
import { Type as UserType } from '../../../src/domain/user/type';
import { Email } from '../../../src/domain/user/email';
import { User } from '../../../src/domain/user';

describe('[Core/Domain] Customer', () => {
  test('should create a customer', () => {
    const email = Email.fromString('john.doe@example.com');
    const userType = UserType.fromString(UserType.Customer);
    const userId = UserId.create();

    const user = User.create(userId, email, userType);

    const customerId = CustomerId.create();

    const mentorId = MentorId.create();
    const role = new CustomerType(CustomerType.Company);

    const customer = new Customer(customerId, user, role, '', [mentorId]);

    expect(customer).toBeInstanceOf(Customer);
  });

  test('instantiation should fail with every invalid argument provided', () => {
    const email = Email.fromString('john.doe@example.com');
    const userType = UserType.fromString(UserType.Customer);
    const userId = UserId.create();

    const user = User.create(userId, email, userType);

    const customerId = CustomerId.create();
    const mentorId = MentorId.create();
    const role = new CustomerType(CustomerType.Company);

    expect(() => new Customer(null, user, role, '', [mentorId])).toThrow();
    expect(() => new Customer(customerId, null, role, '', [mentorId])).toThrow();
    // @ts-expect-error - testing instantiation with invalid argument
    expect(() => new Customer(customerId, userId, role, {}, [mentorId])).toThrow();
    // @ts-expect-error - testing instantiation with invalid argument
    expect(() => new Customer(customerId, userId, role, '', [userId])).toThrow();
  });
});
