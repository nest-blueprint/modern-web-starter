import { Test } from '@nestjs/testing';
import { Repository, Sequelize } from 'sequelize-typescript';
import { UserRepositoryFactory } from '../../../../src/infrastructure/repository/factory/user.repository.factory';
import { UserRepository } from '../../../../src/infrastructure/repository/user.repository';
import { User } from '../../../../src/domain/user';
import { UserNotFoundException } from '../../../../src/infrastructure/exception/user-not-found.exception';
import { SequelizeProvider } from '../../../../src/infrastructure/sequelize/sequelize.provider';
import { UserCollectionToken } from '../../../../src/infrastructure/repository/factory/token.factory';
import { UserMap } from '../../../../src/infrastructure/map/user.map';
import { User as UserEntity } from '../../../../src/infrastructure/sequelize/entity/user.entity';
import { Mentor as MentorEntity } from '../../../../src/infrastructure/sequelize/entity/mentor.entity';
import { Person as PersonEntity } from '../../../../src/infrastructure/sequelize/entity/person.entity';
import { Customer as CustomerEntity } from '../../../../src/infrastructure/sequelize/entity/customer.entity';
import { SequelizeToken } from '../../../../src/infrastructure/sequelize/token/sequelize.token';
import { ConfigLoaderToken } from '../../../../src/infrastructure/init/token.init';
import { appConfig } from '../../../../../../config/autoload/app.config';
import { ConfigLoaderService } from '../../../../src/infrastructure/init/service/config-loader.service';
import { Id as UserId } from '../../../../src/domain/user/id';
import { Email } from '../../../../src/domain/user/email';
import { UserAlreadyExistsException } from '../../../../src/infrastructure/exception/user-already-exists.exception';
import { Transaction } from 'sequelize';
import { runSequelizeTransaction } from '../../util';
import { Type } from '../../../../src/domain/user/type';
import { Auth0UserId } from '../../../../src/infrastructure/resource/auth0/type/auth0-user-id';

describe('[Core/Infrastructure] UserRepository', () => {
  let sequelize: Sequelize;
  let sequelizeUserRepository: Repository<UserEntity>;
  let sequelizeMentorRepository: Repository<MentorEntity>;
  let sequelizePersonRepository: Repository<PersonEntity>;
  let sequelizeCustomerRepository: Repository<CustomerEntity>;
  let userRepository: UserRepository;

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
        UserRepositoryFactory,
        SequelizeProvider,
      ],
    }).compile();

    sequelize = module.get(SequelizeToken);
    sequelizeUserRepository = sequelize.getRepository(UserEntity);
    sequelizeMentorRepository = sequelize.getRepository(MentorEntity);
    sequelizePersonRepository = sequelize.getRepository(PersonEntity);
    sequelizeCustomerRepository = sequelize.getRepository(CustomerEntity);
    userRepository = module.get(UserCollectionToken);
  });

  afterEach(async () => {
    await sequelize.close();
  }, 3000);

  it('UserRepository should be defined and instanced', () => {
    expect(userRepository).toBeDefined();
    expect(userRepository).toBeInstanceOf(UserRepository);
  });

  it('Sequelize User Repository should be defined', () => {
    expect(sequelizeUserRepository).toBeDefined();
  });

  it('Sequelize Mentor Repository should be defined', () => {
    expect(sequelizeMentorRepository).toBeDefined();
  });

  it('Sequelize Person Repository should be defined', () => {
    expect(sequelizePersonRepository).toBeDefined();
  });

  it('Sequelize Customer Repository should be defined', () => {
    expect(sequelizeCustomerRepository).toBeDefined();
  });

  test('findOneByEmail', async () => {
    const userId = UserId.create();
    const email = Email.fromString('john.doe@example.com');
    const userType = Type.fromString('customer');
    const user = User.create(userId, email, userType);

    // Case when user is found
    const findOneByEmailTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|123456789' };

      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });
      const userFromDatabase = await userRepository.findOneByEmail(email);
      expect(userFromDatabase.isOk()).toBeTruthy();
      expect(userFromDatabase._unsafeUnwrap().id.value).toEqual(user.id.value);
      expect(userFromDatabase._unsafeUnwrap().email.value).toEqual(user.email.value);
    };

    // Case when user is not found
    const findOneByEmailTest2 = async () => {
      const userFromDatabase = await userRepository.findOneByEmail(email);
      expect(userFromDatabase.isOk()).toBeTruthy();
      expect(userFromDatabase._unsafeUnwrap()).toEqual(null);
    };

    await expect(runSequelizeTransaction(sequelize, findOneByEmailTest1)).rejects.toThrowError('rollback');
    await expect(runSequelizeTransaction(sequelize, findOneByEmailTest2)).rejects.toThrowError('rollback');
  });

  test('add', async () => {
    const userId = UserId.create();
    const userId2 = UserId.create();

    const email = Email.fromString('john.doe@example.com');
    const email2 = Email.fromString('alice.smith@exemple.com');

    const [role1, role2] = [1, 2].map(() => new Type(Type.Customer));

    const user = User.create(userId, email, role1);
    const user2 = User.create(userId2, email2, role2);

    const auth0UserId = new Auth0UserId('auth0|123456789');
    const auth0UserId2 = new Auth0UserId('auth0|987654321');

    // Case when user is added successfully
    const addTest1 = async () => {
      //@ts-expect-error typing error due to method overloading
      const userFromDatabase = await userRepository.add(user, auth0UserId);
      expect(userFromDatabase.isOk()).toBeTruthy();
      expect(userFromDatabase._unsafeUnwrap().id.value).toEqual(user.id.value);
      expect(userFromDatabase._unsafeUnwrap().email.value).toEqual(user.email.value);
    };

    // Case when user already exists
    const addTest2 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user2), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });
      //@ts-expect-error typing error due to method overloading
      const addUserResult = await userRepository.add(user2, auth0UserId2);
      expect(addUserResult.isErr()).toBeTruthy();
      expect(addUserResult._unsafeUnwrapErr()).toBeInstanceOf(UserAlreadyExistsException);
    };

    await expect(runSequelizeTransaction(sequelize, addTest1)).rejects.toThrowError('rollback');
    await expect(runSequelizeTransaction(sequelize, addTest2)).rejects.toThrowError('rollback');
  });

  test('get', async () => {
    const userId = UserId.create();
    const email = Email.fromString('john.doe@example.com');
    const role = Type.fromString('customer');
    const auth0Id = new Auth0UserId('auth0|0123456789');
    const user = User.create(userId, email, role);

    // Case when user exists
    const getTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: auth0Id.value };

      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      const userFromDatabase = await userRepository.get(userId);
      expect(userFromDatabase.isOk()).toBeTruthy();
      expect(userFromDatabase._unsafeUnwrap().id.value).toEqual(user.id.value);
      expect(userFromDatabase._unsafeUnwrap().email.value).toEqual(user.email.value);
    };

    // Case when user does not exist
    const getTest2 = async () => {
      const userFromDatabase = await userRepository.get(userId);
      expect(userFromDatabase.isErr()).toBeTruthy();
      expect(userFromDatabase._unsafeUnwrapErr()).toBeInstanceOf(UserNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, getTest1)).rejects.toThrowError(new Error('rollback'));
    await expect(runSequelizeTransaction(sequelize, getTest2)).rejects.toThrowError(new Error('rollback'));
  });

  test('delete', async () => {
    const userId = UserId.create();
    const email = Email.fromString('john.doe@example.com');
    const role = Type.fromString('customer');
    const auth0Id = new Auth0UserId('auth0|0123456789');
    const user = User.create(userId, email, role);

    // Case when user exists
    const deleteTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: auth0Id.value };

      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      const userFromDatabase = await userRepository.delete(userId);
      expect(userFromDatabase.isOk()).toBeTruthy();
      expect(userFromDatabase._unsafeUnwrap().id.value).toEqual(user.id.value);
      expect(userFromDatabase._unsafeUnwrap().email.value).toEqual(user.email.value);
    };

    // Case when user does not exist
    const deleteTest2 = async () => {
      const userFromDatabase = await userRepository.delete(userId);
      expect(userFromDatabase.isErr()).toBeTruthy();
      expect(userFromDatabase._unsafeUnwrapErr()).toBeInstanceOf(UserNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, deleteTest1)).rejects.toThrowError(new Error('rollback'));
    await expect(runSequelizeTransaction(sequelize, deleteTest2)).rejects.toThrowError(new Error('rollback'));
  });

  test('find', async () => {
    const userId = UserId.create();
    const userId2 = UserId.create();
    const email = Email.fromString('john1.doe@example.com');
    const email2 = Email.fromString('alice.smith@example.com');

    const [role1, role2] = [1, 2].map(() => new Type(Type.Customer));

    const user = User.create(userId, email, role1);
    const user2 = User.create(userId2, email2, role2);

    // Case when users exist
    const findTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|000123456' };
      const userJson2 = { ...UserMap.toJSON(user2), auth0_id: 'auth0|000123567' };

      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson2, { transaction });

      const userFromDatabase = await userRepository.find([userId, userId2]);

      expect(userFromDatabase.isOk()).toBeTruthy();
      expect(userFromDatabase._unsafeUnwrap().length).toEqual(2);
      expect(userFromDatabase._unsafeUnwrap().find((user) => user.id.value === userId.value)).toBeDefined();
      expect(userFromDatabase._unsafeUnwrap().find((user) => user.id.value === userId2.value)).toBeDefined();
    };

    // Case when no user id is provided
    const findTest2 = async () => {
      const userFromDatabase = await userRepository.find([]);
      expect(userFromDatabase.isOk()).toBeTruthy();
      expect(userFromDatabase._unsafeUnwrap().length).toEqual(0);
    };

    // Case when user does not exist
    const findTest3 = async () => {
      const userFromDatabase = await userRepository.find([userId]);
      expect(userFromDatabase.isOk()).toBeTruthy();
      expect(userFromDatabase._unsafeUnwrap().length).toEqual(0);
    };

    // Case when multiple users do not exist
    const findTest4 = async () => {
      const userFromDatabase = await userRepository.find([userId, UserId.create()]);
      expect(userFromDatabase.isOk()).toBeTruthy();
      expect(userFromDatabase._unsafeUnwrap().length).toEqual(0);
    };

    await expect(runSequelizeTransaction(sequelize, findTest1)).rejects.toThrowError('rollback');
    await expect(runSequelizeTransaction(sequelize, findTest2)).rejects.toThrowError('rollback');
    await expect(runSequelizeTransaction(sequelize, findTest3)).rejects.toThrowError('rollback');
    await expect(runSequelizeTransaction(sequelize, findTest4)).rejects.toThrowError('rollback');
  });

  test('update', async () => {
    const userId = UserId.create();
    const email = Email.fromString('john2.doe@example.com');
    const email2 = Email.fromString('alice.smith@example.com');

    const [role1, role2] = [1, 2].map(() => new Type(Type.Customer));

    const user = User.create(userId, email, role1);
    const userUpdated = User.create(userId, email2, role2);

    // Case when user exists
    const updateTest = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|000123456' };

      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      const updateResult = await userRepository.update(userUpdated);

      expect(updateResult.isOk()).toBeTruthy();
      expect(updateResult._unsafeUnwrap().id.value).toEqual(userId.value);
      expect(updateResult._unsafeUnwrap().email.value).toEqual(email2.value);
    };

    // Case when user does not exist
    const updateTest2 = async () => {
      const updateResult = await userRepository.update(userUpdated);
      expect(updateResult.isErr()).toBeTruthy();
      expect(updateResult._unsafeUnwrapErr()).toBeInstanceOf(UserNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, updateTest)).rejects.toThrowError('rollback');
    await expect(runSequelizeTransaction(sequelize, updateTest2)).rejects.toThrowError('rollback');
  });

  test('count', async () => {
    const userId = UserId.create();
    const userId2 = UserId.create();
    const email = Email.fromString('john.doe@example.com');
    const email2 = Email.fromString('alice.smith@example.com');

    const [role1, role2] = [1, 2].map(() => new Type(Type.Customer));

    const user = User.create(userId, email, role1);
    const user2 = User.create(userId2, email2, role2);

    const countTest1 = async (transaction: Transaction) => {
      const userFromDatabaseCountBefore = await sequelizeUserRepository.count({ transaction });
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|000123456' };
      const userJson2 = { ...UserMap.toJSON(user2), auth0_id: 'auth0|000123567' };

      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson2, { transaction });

      const userFromDatabase = await userRepository.count();
      expect(userFromDatabase._unsafeUnwrap()).toEqual(userFromDatabaseCountBefore + 2);
    };

    await expect(runSequelizeTransaction(sequelize, countTest1)).rejects.toThrowError('rollback');
  });

  test('getUserByAuth0Id', async () => {
    const getUserByAuth0IdTest1 = async (transaction: Transaction) => {
      const userId = UserId.create();
      const email = Email.fromString('john2.doe@example.com');
      const auth0UserId = new Auth0UserId('auth0|000123456');

      const role = new Type(Type.Customer);

      const user = User.create(userId, email, role);

      const userJson = { ...UserMap.toJSON(user), auth0_id: auth0UserId.value };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      const userFromDatabase = await userRepository.getUserByAuth0Id(auth0UserId);
      expect(userFromDatabase.isOk()).toBeTruthy();
      expect(userFromDatabase._unsafeUnwrap().id.value).toEqual(userId.value);
    };

    const getUserByAuth0IdTest21 = async () => {
      const auth0UserId = new Auth0UserId('auth0|000123456');

      const userFromDatabase = await userRepository.getUserByAuth0Id(auth0UserId);
      expect(userFromDatabase.isErr()).toBeTruthy();
      expect(userFromDatabase._unsafeUnwrapErr()).toBeInstanceOf(UserNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, getUserByAuth0IdTest1)).rejects.toThrowError('rollback');
    await expect(runSequelizeTransaction(sequelize, getUserByAuth0IdTest21)).rejects.toThrowError('rollback');
  });
});
