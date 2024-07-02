import { Test } from '@nestjs/testing';
import { Repository, Sequelize } from 'sequelize-typescript';
import { CustomerRepository } from '../../../../src/infrastructure/repository/customer.repository';
import { CustomerRepositoryFactory } from '../../../../src/infrastructure/repository/factory/customer.repository.factory';
import { Customer } from '../../../../src/domain/customer';
import { Customer as CustomerEntity } from '../../../../src/infrastructure/sequelize/entity/customer.entity';
import { User as UserEntity } from '../../../../src/infrastructure/sequelize/entity/user.entity';
import { CustomerMap } from '../../../../src/infrastructure/map/customer.map';
import { SequelizeToken } from '../../../../src/infrastructure/sequelize/token/sequelize.token';
import { appConfig } from '../../../../../../config/autoload/app.config';
import { ConfigLoaderService } from '../../../../src/infrastructure/init/service/config-loader.service';
import { ConfigLoaderToken } from '../../../../src/infrastructure/init/token.init';
import { CustomerCollectionToken } from '../../../../src/infrastructure/repository/factory/token.factory';
import { SequelizeProvider } from '../../../../src/infrastructure/sequelize/sequelize.provider';
import { Id as UserId } from '../../../../src/domain/user/id';
import { Id as CustomerId } from '../../../../src/domain/customer/id';
import { Email } from '../../../../src/domain/user/email';
import { Type as UserType } from '../../../../src/domain/user/type';
import { Type as CustomerType } from '../../../../src/domain/customer/type';
import { Auth0UserId } from '../../../../src/infrastructure/resource/auth0/type/auth0-user-id';
import { User } from '../../../../src/domain/user';
import { UserMap } from '../../../../src/infrastructure/map/user.map';
import { Transaction } from 'sequelize';
import { runSequelizeTransaction } from '../../util';
import { RuntimeErrorException } from '../../../../src/infrastructure/exception/runtime-error.exception';
import { CustomerNotFoundException } from '../../../../src/infrastructure/exception/customer-not-found.exception';
describe('[Core/Infrastructure] CustomerRepository', () => {
  let sequelize: Sequelize;
  let sequelizeCustomerRepository: Repository<CustomerEntity>;
  let sequelizeUserRepository: Repository<UserEntity>;
  let customerRepository: CustomerRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        {
          provide: ConfigLoaderToken,
          useFactory: () => {
            const config = appConfig();
            return new ConfigLoaderService(config);
          },
        },
        CustomerRepositoryFactory,
        SequelizeProvider,
      ],
    }).compile();

    sequelize = module.get(SequelizeToken);
    sequelizeCustomerRepository = sequelize.getRepository(CustomerEntity);
    sequelizeUserRepository = sequelize.getRepository(UserEntity);
    customerRepository = module.get(CustomerCollectionToken);
  });

  it('Sequelize should be defined', () => {
    expect(sequelize).toBeDefined();
    expect(sequelize).toBeInstanceOf(Sequelize);
  }, 3000);

  it('CustomerRepository should be defined', () => {
    expect(customerRepository).toBeDefined();
    expect(customerRepository).toBeInstanceOf(CustomerRepository);
  }, 3000);

  it('SequelizeCustomerRepository should be defined', () => {
    expect(sequelizeCustomerRepository).toBeDefined();
  });

  it('SequelizeUserRepository should be defined', () => {
    expect(sequelizeUserRepository).toBeDefined();
  });

  afterEach(async () => {
    await sequelize.close();
  }, 3000);

  test('Should add a new customer', async () => {
    const userId = UserId.create();
    const email = Email.fromString('john.doe@example.com');
    const userType = new UserType(UserType.Customer);

    const auth0UserId = new Auth0UserId('auth0|0123456789');

    const user = new User(userId, email, userType);

    const customerId = CustomerId.create();
    const customerType = new CustomerType(CustomerType.Individual);
    const profileDescription = 'John Doe profile description';

    const customer = new Customer(customerId, user, customerType, profileDescription, []);

    // Case when the customer is successfully added
    const addTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: auth0UserId.value };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      const addCustomerResult = await customerRepository.add(customer);

      expect(addCustomerResult.isOk()).toBeTruthy();
      expect(addCustomerResult._unsafeUnwrap()).toBeInstanceOf(Customer);
    };

    // Case when the customer is not added because the user does not exist
    const addTest2 = async () => {
      const addCustomerResult = await customerRepository.add(customer);
      expect(addCustomerResult.isErr()).toBeTruthy();
      expect(addCustomerResult._unsafeUnwrapErr()).toBeInstanceOf(RuntimeErrorException);
    };

    await expect(runSequelizeTransaction(sequelize, addTest1)).rejects.toThrowError('rollback');
    await expect(runSequelizeTransaction(sequelize, addTest2)).rejects.toThrowError('rollback');
  }, 10000);

  test('Should delete a customer', async () => {
    const userId = UserId.create();
    const email = Email.fromString('john1.doe@example.com');
    const userType = new UserType(UserType.Customer);

    const auth0UserId = new Auth0UserId('auth0|0123456789');

    const user = new User(userId, email, userType);

    const customerId = CustomerId.create();
    const customerType = new CustomerType(CustomerType.Individual);
    const profileDescription = 'John Doe profile description';

    const customer = new Customer(customerId, user, customerType, profileDescription, []);

    // Case when the customer is successfully deleted
    const deleteTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: auth0UserId.value };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });
      const customerJson = CustomerMap.toJSON(customer);

      //@ts-expect-error typing error with bookmarked_mentors property
      await sequelizeCustomerRepository.create(customerJson, { transaction });

      const result = await customerRepository.delete(customerId);
      expect(result.isOk()).toBeTruthy();
      expect(result._unsafeUnwrap()).toBeInstanceOf(Customer);
      //@ts-expect-error avoid typing error
      await sequelizeCustomerRepository.create(customerJson, { transaction });
    };

    // Case when the customer is not deleted because the customer does not exist
    const deleteTest2 = async () => {
      const result = await customerRepository.delete(customerId);
      expect(result.isErr()).toBeTruthy();
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(CustomerNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, deleteTest1)).rejects.toThrowError('rollback');
    await expect(runSequelizeTransaction(sequelize, deleteTest2)).rejects.toThrowError('rollback');
  });

  test('Should retrieve a customer using customer_id', async () => {
    const userId = UserId.create();
    const email = Email.fromString('john.doe@example.com');
    const userType = new UserType(UserType.Customer);

    const auth0UserId = new Auth0UserId('auth0|0123456789');

    const user = new User(userId, email, userType);

    const customerId = CustomerId.create();
    const customerType = new CustomerType(CustomerType.Individual);
    const profileDescription = 'John Doe profile description';

    const customer = new Customer(customerId, user, customerType, profileDescription, []);

    // Case when the customer is successfully retrieved
    const retrieveTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: auth0UserId.value };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });
      const customerJson = CustomerMap.toJSON(customer);

      //@ts-expect-error typing error with bookmarked_mentors property
      await sequelizeCustomerRepository.create(customerJson, { transaction });

      const result = await customerRepository.get(customerId);
      expect(result.isOk()).toBeTruthy();
      expect(result._unsafeUnwrap()).toBeInstanceOf(Customer);
    };

    // Case when the customer is not retrieved because the customer does not exist
    const retrieveTest2 = async () => {
      const result = await customerRepository.get(customerId);
      expect(result.isErr()).toBeTruthy();
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(CustomerNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, retrieveTest1)).rejects.toThrowError('rollback');
    await expect(runSequelizeTransaction(sequelize, retrieveTest2)).rejects.toThrowError('rollback');
  });

  test('Should retrieve a customer using user_id', async () => {
    const userId = UserId.create();
    const email = Email.fromString('john3.doe@example.com');
    const userType = new UserType(UserType.Customer);

    const auth0UserId = new Auth0UserId('auth0|0123456789');

    const user = new User(userId, email, userType);

    const customerId = CustomerId.create();
    const customerType = new CustomerType(CustomerType.Individual);
    const profileDescription = 'John Doe profile description';

    const customer = new Customer(customerId, user, customerType, profileDescription, []);

    // Case when the customer is successfully retrieved
    const retrieveTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: auth0UserId.value };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });
      const customerJson = CustomerMap.toJSON(customer);

      //@ts-expect-error typing error with bookmarked_mentors property
      await sequelizeCustomerRepository.create(customerJson, { transaction });

      const result = await customerRepository.getByUserId(userId);
      expect(result.isOk()).toBeTruthy();
      expect(result._unsafeUnwrap()).toBeInstanceOf(Customer);
    };

    // Case when the customer is not retrieved because the customer does not exist
    const retrieveTest2 = async () => {
      const result = await customerRepository.getByUserId(userId);
      expect(result.isErr()).toBeTruthy();
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(CustomerNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, retrieveTest1)).rejects.toThrowError('rollback');
    await expect(runSequelizeTransaction(sequelize, retrieveTest2)).rejects.toThrowError('rollback');
  });

  test('Should update a customer', async () => {
    const userId = UserId.create();
    const email = Email.fromString('john3.doe@example.com');
    const userType = new UserType(UserType.Customer);

    const auth0UserId = new Auth0UserId('auth0|0123456789');

    const user = new User(userId, email, userType);

    const customerId = CustomerId.create();
    const customerType = new CustomerType(CustomerType.Individual);
    const profileDescription = 'John Doe profile description';

    const customer = new Customer(customerId, user, customerType, profileDescription, []);

    // Case when the customer is successfully updated
    const updateTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: auth0UserId.value };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });
      const customerJson = CustomerMap.toJSON(customer);

      //@ts-expect-error typing error with bookmarked_mentors property
      await sequelizeCustomerRepository.create(customerJson, { transaction });

      const newProfileDescription = 'New profile description';
      const updatedCustomer = new Customer(customerId, user, customerType, newProfileDescription, []);
      const result = await customerRepository.update(updatedCustomer);
      expect(result.isOk()).toBeTruthy();
      expect(result._unsafeUnwrap()).toBeInstanceOf(Customer);
    };

    // Case when the customer is not updated because the customer does not exist
    const updateTest2 = async () => {
      const newProfileDescription = 'New profile description';
      const updatedCustomer = new Customer(customerId, user, customerType, newProfileDescription, []);
      const result = await customerRepository.update(updatedCustomer);
      expect(result.isErr()).toBeTruthy();
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(CustomerNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, updateTest1)).rejects.toThrowError('rollback');
    await expect(runSequelizeTransaction(sequelize, updateTest2)).rejects.toThrowError('rollback');
  });

  test('count() should return the number of customers', async () => {
    const userId = UserId.create();
    const email = Email.fromString('john3.doe@example.com');
    const userType = new UserType(UserType.Customer);

    const auth0UserId = new Auth0UserId('auth0|0123456789');

    const user = new User(userId, email, userType);

    const customerId = CustomerId.create();
    const customerType = new CustomerType(CustomerType.Individual);
    const profileDescription = 'John Doe profile description';

    const customer = new Customer(customerId, user, customerType, profileDescription, []);

    const countTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: auth0UserId.value };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });
      const customerJson = CustomerMap.toJSON(customer);

      //@ts-expect-error typing error with bookmarked_mentors property
      await sequelizeCustomerRepository.create(customerJson, { transaction });

      const result = await customerRepository.count();
      expect(result.isOk()).toBeTruthy();
      expect(result._unsafeUnwrap()).toBe(1);
    };

    await expect(runSequelizeTransaction(sequelize, countTest1)).rejects.toThrowError('rollback');
  });
});
