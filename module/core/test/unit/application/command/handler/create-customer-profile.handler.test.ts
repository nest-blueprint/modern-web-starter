import { Test } from '@nestjs/testing';
import { Uuid } from '../../../../../src/infrastructure/type/uuid.type';
import { CustomerAlreadyExistsException } from '../../../../../src/infrastructure/exception/customer-already-exists.exception';
import {
  CustomerCollectionToken,
  UserCollectionToken,
} from '../../../../../src/infrastructure/repository/factory/token.factory';
import { CreateCustomerProfileHandler } from '../../../../../src/application/command/handler/create-customer-profile.handler';
import { InMemoryCustomerRepository } from '../../../../double/repository/in-memory-customer.repository';
import { CreateCustomerProfileCommand } from '../../../../../src/application/command/create-customer-profile-command';
import { TypeEnum } from '../../../../../src/domain/customer/type';
import { InMemoryUserRepository } from '../../../../double/repository/in-memory-user-repository';
import { Id as UserId } from '../../../../../src/domain/user/id';
import { Id as CustomerId } from '../../../../../src/domain/customer/id';
import { Type as UserType } from '../../../../../src/domain/user/type';
import { Email } from '../../../../../src/domain/user/email';
import { User } from '../../../../../src/domain/user';

describe('[Core/Application] CreateCustomerProfileHandler', () => {
  let createCustomerProfileHandler: CreateCustomerProfileHandler;

  let customerRepository: InMemoryCustomerRepository;
  let userRepository: InMemoryUserRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        CreateCustomerProfileHandler,
        { provide: CustomerCollectionToken, useClass: InMemoryCustomerRepository },
        { provide: UserCollectionToken, useClass: InMemoryUserRepository },
      ],
    }).compile();

    createCustomerProfileHandler = module.get(CreateCustomerProfileHandler);
    customerRepository = module.get(CustomerCollectionToken);
    userRepository = module.get(UserCollectionToken);
  });

  beforeEach(() => {
    customerRepository.clear();
  });

  it('CreateCustomerProfileHandler should be defined', () => {
    expect(createCustomerProfileHandler).toBeDefined();
    expect(createCustomerProfileHandler).toBeInstanceOf(CreateCustomerProfileHandler);
  });

  it('CustomerRepository should be defined', () => {
    expect(customerRepository).toBeDefined();
    expect(customerRepository).toBeInstanceOf(InMemoryCustomerRepository);
  });

  test('Register a new customer', async () => {
    const countBefore = customerRepository.count();

    // We need to create a user first.
    const userId = UserId.create();
    const email = Email.fromString('john.doe@example.com');
    const userType = UserType.fromString(UserType.Customer);

    const user = User.create(userId, email, userType);

    const userAddResult = userRepository.add(user);

    expect(userAddResult.isOk()).toBeTruthy();

    const command = new CreateCustomerProfileCommand(userId.value, Uuid.random(), TypeEnum.Individual);

    await createCustomerProfileHandler.execute(command);

    const countAfter = customerRepository.count();
    expect(countBefore + 1).toEqual(countAfter);
  });

  test('Register a new customer, but with same credentials', async () => {
    const countBefore = customerRepository.count();
    const customerId = CustomerId.create();

    // We need to create a user first.
    const userId = UserId.create();
    const email = Email.fromString('john.doe@example.com');
    const userType = UserType.fromString(UserType.Customer);

    const user = User.create(userId, email, userType);
    const userAddResult = userRepository.add(user);

    expect(userAddResult.isOk()).toBeTruthy();

    const command = new CreateCustomerProfileCommand(userId.value, customerId.value, TypeEnum.Individual);

    await createCustomerProfileHandler.execute(command);

    expect(countBefore + 1).toEqual(customerRepository.count());

    // Test if the command throws an exception with the same customer uuid
    const command2 = new CreateCustomerProfileCommand(Uuid.random(), customerId.value, TypeEnum.Individual);

    await expect(async () => createCustomerProfileHandler.execute(command2)).rejects.toThrowError(
      CustomerAlreadyExistsException,
    );

    // Test if the command throws an exception with the same user uuid
    const command3 = new CreateCustomerProfileCommand(userId.value, Uuid.random(), TypeEnum.Individual);

    await expect(async () => createCustomerProfileHandler.execute(command3)).rejects.toThrowError(
      CustomerAlreadyExistsException,
    );
  });
});
