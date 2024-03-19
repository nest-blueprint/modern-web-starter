import { Sequelize } from 'sequelize-typescript';
import { Test } from '@nestjs/testing';
import { ConfigLoaderToken } from '../../../../src/infrastructure/init/token.init';
import { appConfig } from '../../../../../../config/autoload/app.config';
import { ConfigLoaderService } from '../../../../src/infrastructure/init/service/config-loader.service';
import { SequelizeProvider } from '../../../../src/infrastructure/sequelize/sequelize.provider';
import { SequelizeToken } from '../../../../src/infrastructure/sequelize/token/sequelize.token';
import { Customer as CustomerEntity } from '../../../../../core/src/infrastructure/sequelize/entity/customer.entity';
import { User as UserEntity } from '../../../../../core/src/infrastructure/sequelize/entity/user.entity';
import { Customer as CustomerRaw } from '../../../../../core/src/infrastructure/type/raw/customer.raw';
import { User as UserRaw } from '../../../../../core/src/infrastructure/type/raw/user.raw';
import { CustomerMap } from '../../../../src/infrastructure/map/customer.map';
import { Customer } from '../../../../src/domain/customer';
import { Id as CustomerId } from '../../../../../core/src/domain/customer/id';
import { Id as UserId } from '../../../../../core/src/domain/user/id';
import { Type as CustomerType } from '../../../../../core/src/domain/customer/type';
import { randomBetween } from '../../../double/provider/external/auth0/util/auth0.util';
import { Email } from '../../../../src/domain/user/email';
import { Type as UserType } from '../../../../src/domain/user/type';
import { Transaction } from 'sequelize';
import { runSequelizeTransaction } from '../../util';
import { User } from '../../../../src/domain/user';
import { UserMap } from '../../../../src/infrastructure/map/user.map';

describe('[Core/Infrastructure] CustomerMap', () => {
  let sequelize: Sequelize;
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
        SequelizeProvider,
      ],
    }).compile();
    sequelize = module.get(SequelizeToken);
  });

  it('Sequelize should be defined', async () => {
    expect(sequelize).toBeDefined();
    expect(sequelize).toBeInstanceOf(Sequelize);
  });

  test('CustomerMap.toEntity', async () => {
    // Safest way to test if CustomerMap.toEntity is working is to create a customer in the database using it.

    const userRepository = sequelize.getRepository(UserEntity);
    const customerRepository = sequelize.getRepository(CustomerEntity);

    const userId = UserId.create();
    const email = Email.fromString('john.doe@example.com');
    const userType = UserType.fromString('customer');

    const customerId = CustomerId.create();

    const customerType = CustomerType.fromString(CustomerType.Individual);
    const profileDescription = 'profile description';

    const user = User.create(userId, email, userType);

    const customer = new Customer(customerId, user, customerType, profileDescription, []);

    const userRaw: UserRaw & { auth0_id: string } = {
      user_id: userId.value,
      auth0_id: `auth0|${randomBetween(1000000000, 9999999999)}`,
      email: Email.fromString('john.doe@example.com').value,
      type: UserType.fromString(UserType.Customer).value,
    };

    const createCustomerUsingEntity = async (transaction: Transaction) => {
      //@ts-expect-error avoid type error
      await userRepository.create(userRaw, { transaction });

      const customerEntity = CustomerMap.toEntity(customer);
      await customerEntity.save({ transaction });

      const customerFromDatabase = await customerRepository.findByPk(customerId.value, { transaction });
      expect(customerFromDatabase).toBeDefined();

      const customerFromDatabaseRaw = customerFromDatabase.get({ plain: true });

      expect(customerFromDatabaseRaw).toBeDefined();
      expect(customerFromDatabaseRaw.customer_id).toEqual(customerId.value);
    };

    await expect(runSequelizeTransaction(sequelize, createCustomerUsingEntity)).rejects.toThrow('rollback');
  });

  test('CustomerMap.toRaw', async () => {
    const customerId = CustomerId.create();
    const userId = UserId.create();
    const customerType = CustomerType.fromString(CustomerType.Individual);
    const profileDescription = 'profile description';

    const user = User.create(userId, Email.fromString('john.doe@example.com'), UserType.fromString(UserType.Customer));

    const customer = new Customer(customerId, user, customerType, profileDescription, []);

    const customerRaw = CustomerMap.toRaw(customer);

    expect(customerRaw).toBeDefined();
    expect(customerRaw.customer_id).toEqual(customerId.value);
    expect(customerRaw.user).toEqual(UserMap.toRaw(user));
    expect(customerRaw.type).toEqual(customerType.value);
    expect(customerRaw.profile_description).toEqual(profileDescription);
    expect(customerRaw.bookmarked_mentors).toEqual([]);
  });

  test('CustomerMap.toDomain', async () => {
    // CustomerMap.toDomain(customer: CustomerRaw): Result<Customer,Error>

    const userId = UserId.create();
    const email = Email.fromString('john.doe@example.com');
    const userType = UserType.fromString(UserType.Customer);

    const user = User.create(userId, email, userType);

    const customerRaw: CustomerRaw = {
      customer_id: CustomerId.create().value,
      user: UserMap.toRaw(user),
      type: CustomerType.fromString(CustomerType.Individual).value,
      profile_description: 'profile description',
      bookmarked_mentors: [],
    };

    const customerResult = CustomerMap.toDomain(customerRaw);
    expect(customerResult.isOk()).toBeTruthy();

    const customer = customerResult._unsafeUnwrap();

    expect(customer.user).toBeInstanceOf(User);

    expect(customer.user.id.value).toEqual(userId.value);

    expect(customer.id.value).toEqual(customerRaw.customer_id);

    expect(customer.customerType.value).toEqual(customerRaw.type);
    expect(customer.profileDescription).toEqual(customerRaw.profile_description);
    expect(customer.bookmarkedMentors).toEqual(customerRaw.bookmarked_mentors);

    // CustomerMap.toDomain(customer: CustomerEntity): Result<Customer,Error>
    const customerEntity = new CustomerEntity();
    customerEntity.customer_id = customerRaw.customer_id;
    customerEntity.user_id = customerRaw.user.user_id;
    customerEntity.type = customerRaw.type;
    customerEntity.profile_description = customerRaw.profile_description;
    customerEntity.bookmarked_mentors = [];

    const customerResult2 = CustomerMap.toDomain(customerEntity);
    expect(customerResult2.isOk()).toBeTruthy();

    const customer2 = customerResult2._unsafeUnwrap();
    expect(customer2.id.value).toEqual(customerRaw.customer_id);
    expect(customer2.user.id.value).toEqual(customerRaw.user.user_id);
    expect(customer2.customerType.value).toEqual(customerRaw.type);
    expect(customer2.profileDescription).toEqual(customerRaw.profile_description);
    expect(customer2.bookmarkedMentors).toEqual(customerRaw.bookmarked_mentors);
  });
});
