import { Test } from '@nestjs/testing';
import { ConfigLoaderToken } from '../../../../src/infrastructure/init/token.init';
import { appConfig } from '../../../../../../config/autoload/app.config';
import { ConfigLoaderService } from '../../../../src/infrastructure/init/service/config-loader.service';
import { SequelizeProvider } from '../../../../src/infrastructure/sequelize/sequelize.provider';
import { SequelizeToken } from '../../../../src/infrastructure/sequelize/token/sequelize.token';
import { Repository, Sequelize } from 'sequelize-typescript';
import { PersonRepository } from '../../../../src/infrastructure/repository/person.repository';
import { PersonRepositoryFactory } from '../../../../src/infrastructure/repository/factory/person.repository.factory';
import { Person } from '../../../../src/domain/person';
import { Person as PersonEntity } from '../../../../src/infrastructure/sequelize/entity/person.entity';
import { PersonMap } from '../../../../src/infrastructure/map/person.map';
import { PersonNotFoundException } from '../../../../src/infrastructure/exception/person-not-found.exception';
import { PersonCollectionToken } from '../../../../src/infrastructure/repository/factory/token.factory';
import { Id as UserId } from '../../../../src/domain/user/id';
import { Email } from '../../../../src/domain/user/email';
import { User } from '../../../../src/domain/user';
import { Id as PersonId } from '../../../../src/domain/person/id';
import { UserMap } from '../../../../src/infrastructure/map/user.map';
import { User as UserEntity } from '../../../../src/infrastructure/sequelize/entity/user.entity';
import { Transaction } from 'sequelize';
import { runSequelizeTransaction } from '../../util';
import { Type } from '../../../../src/domain/user/type';

describe('[Core/Infrastructure] PersonRepository', () => {
  let sequelize: Sequelize;
  let sequelizePersonRepository: Repository<PersonEntity>;
  let sequelizeUserRepository: Repository<UserEntity>;
  let personRepository: PersonRepository;

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
        PersonRepositoryFactory,
        SequelizeProvider,
      ],
    }).compile();

    sequelize = module.get(SequelizeToken);
    sequelizePersonRepository = sequelize.getRepository(PersonEntity);
    sequelizeUserRepository = sequelize.getRepository(UserEntity);
    personRepository = module.get(PersonCollectionToken);
  });

  it('Sequelize should be defined', () => {
    expect(sequelize).toBeDefined();
    expect(sequelize).toBeInstanceOf(Sequelize);
  }, 3000);

  it('PersonRepository should be defined', () => {
    expect(personRepository).toBeDefined();
    expect(personRepository).toBeInstanceOf(PersonRepository);
  }, 3000);

  afterEach(async () => {
    await sequelize.close();
  }, 3000);

  test('add', async () => {
    const userId = UserId.create();
    const personId = PersonId.create();
    const email = Email.fromString('john.doe@example.com');
    const role = Type.fromString('customer');
    const user = User.create(userId, email, role);
    const person = new Person(personId, userId, 'John', 'Doe', null, null, null, null, null);

    // Happy path
    const addTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|123456789' };

      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      const personFromDatabaseResult = await personRepository.add(person);
      expect(personFromDatabaseResult.isOk()).toBeTruthy();
      expect(personFromDatabaseResult._unsafeUnwrap().id.value).toEqual(person.id.value);
    };

    // Case when user does not exist
    const addTest2 = async () => {
      const personFromDatabaseResult = await personRepository.add(person);
      expect(personFromDatabaseResult.isErr()).toBeTruthy();
    };

    await expect(runSequelizeTransaction(sequelize, addTest1)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, addTest2)).rejects.toThrow('rollback');
  }, 10000);

  test('delete', async () => {
    const userId = UserId.create();
    const personId = PersonId.create();
    const email = Email.fromString('john.doe@example.com');
    const role = Type.fromString('customer');
    const user = User.create(userId, email, role);
    const person = new Person(personId, userId, 'John', 'Doe', null, null, null, null, null);

    // Happy path
    const deleteTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|123456789' };

      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });
      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });
      const personFromDatabaseResult = await personRepository.delete(person.id);

      expect(personFromDatabaseResult.isOk()).toBeTruthy();
      expect(personFromDatabaseResult._unsafeUnwrap().id).toBeDefined();
      expect(personFromDatabaseResult._unsafeUnwrap().id.value).toEqual(person.id.value);
    };

    // Try  to delete a person that does not exist
    const deleteTest2 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|123456789' };

      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });
      const personFromDatabaseResult = await personRepository.delete(person.id);

      expect(personFromDatabaseResult.isErr()).toBeTruthy();
      expect(personFromDatabaseResult._unsafeUnwrapErr()).toBeInstanceOf(PersonNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, deleteTest1)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, deleteTest2)).rejects.toThrow('rollback');
  }, 10000);

  test('get', async () => {
    const userId = UserId.create();
    const personId = PersonId.create();
    const email = Email.fromString('john.doe@example.com');
    const role = Type.fromString('customer');
    const user = User.create(userId, email, role);
    const person = new Person(personId, userId, 'John', 'Doe', null, null, null, null, null);

    // Happy path
    const getTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|123456789' };

      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });
      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });
      const personFromDatabaseResult = await personRepository.get(person.id);
      expect(personFromDatabaseResult.isOk()).toBeTruthy();
      expect(personFromDatabaseResult._unsafeUnwrap().id.value).toEqual(person.id.value);
    };

    // Try  to get a person that does not exist
    const getTest2 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|123456789' };

      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });
      const personFromDatabaseResult = await personRepository.get(person.id);
      expect(personFromDatabaseResult.isErr()).toBeTruthy();
      expect(personFromDatabaseResult._unsafeUnwrapErr()).toBeInstanceOf(PersonNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, getTest1)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, getTest2)).rejects.toThrow('rollback');
  }, 10000);

  test('update', async () => {
    const userId = UserId.create();
    const email = Email.fromString('john.doe@example.com');

    const role = Type.fromString('customer');

    const user = new User(userId, email, role);

    const person = Person.create(userId);
    const updatedPerson = new Person(person.id, userId, 'John', 'Doe', null, null, null, null, null);

    // Happy path
    const updateTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|123456789' };

      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });
      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });
      const personFromDatabaseResult = await personRepository.update(updatedPerson);
      expect(personFromDatabaseResult.isOk()).toBeTruthy();
      expect(personFromDatabaseResult._unsafeUnwrap().id).toBeDefined();
      expect(personFromDatabaseResult._unsafeUnwrap().id.value).toEqual(person.id.value);
      expect(personFromDatabaseResult._unsafeUnwrap().firstname).toEqual(updatedPerson.firstname);
      expect(personFromDatabaseResult._unsafeUnwrap().lastname).toEqual(updatedPerson.lastname);
    };

    // Try  to update a person that does not exist
    const updateTest2 = async () => {
      const personFromDatabaseResult = await personRepository.update(updatedPerson);
      expect(personFromDatabaseResult.isErr()).toBeTruthy();
      expect(personFromDatabaseResult._unsafeUnwrapErr()).toBeInstanceOf(PersonNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, updateTest1)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, updateTest2)).rejects.toThrow('rollback');
  }, 10000);
});
