import { Sequelize } from 'sequelize-typescript';
import { Test } from '@nestjs/testing';
import { ConfigLoaderToken } from '../../../../src/infrastructure/init/token.init';
import { appConfig } from '../../../../../../config/autoload/app.config';
import { ConfigLoaderService } from '../../../../src/infrastructure/init/service/config-loader.service';
import { SequelizeProvider } from '../../../../src/infrastructure/sequelize/sequelize.provider';
import { SequelizeToken } from '../../../../src/infrastructure/sequelize/token/sequelize.token';
import { Person as PersonEntity } from '../../../../../core/src/infrastructure/sequelize/entity/person.entity';
import { User as UserEntity } from '../../../../../core/src/infrastructure/sequelize/entity/user.entity';
import { Id as PersonId } from '../../../../../core/src/domain/person/id';
import { Id as UserId } from '../../../../../core/src/domain/user/id';
import { PersonMap } from '../../../../src/infrastructure/map/person.map';
import { Person } from '../../../../src/domain/person';
import { User as UserRaw } from '../../../../src/infrastructure/type/raw/user.raw';
import { Person as PersonRaw } from '../../../../src/infrastructure/type/raw/person.raw';
import { Type } from '../../../../src/domain/user/type';
import { randomBetween, randomString } from '../../../double/provider/external/auth0/util/auth0.util';
import { Transaction } from 'sequelize';
import { runSequelizeTransaction } from '../../util';
import { PhoneNumber } from '../../../../src/domain/person/phone-number';
import { LinkedinProfileUrl } from '../../../../src/infrastructure/type/linkedin-profile-url.type';

describe('[Core/Infrastructure] PersonMap', () => {
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

  it('Sequelize should be defined', () => {
    expect(sequelize).toBeDefined();
    expect(sequelize).toBeInstanceOf(Sequelize);
  });

  test('PersonMap.toEntity', async () => {
    const personRepository = sequelize.getRepository(PersonEntity);
    const userRepository = sequelize.getRepository(UserEntity);

    const userRaw: UserRaw & { auth0_id: string } = {
      user_id: UserId.random(),
      email: 'john.doe@example.com',
      type: Type.Customer,
      auth0_id: `auth0|${randomBetween(100000000000, 999999999999)}`,
    };

    const personId = PersonId.create();
    const userId = new UserId(userRaw.user_id);
    const person = new Person(
      personId,
      userId,
      'John',
      'Doe',
      PhoneNumber.fromString('+33600000000'),
      'John',
      LinkedinProfileUrl.fromString('https://www.linkedin.com/in/johndoe/'),
      randomString(60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'),
    );

    const createPersonUsingEntity = async (transaction: Transaction) => {
      //@ts-expect-error avoid typing issues
      await userRepository.create(userRaw, { transaction });

      const personEntity = PersonMap.toEntity(person);

      await personEntity.save({ transaction });

      const personEntityFromDb = await personRepository.findByPk(personId.value, { transaction });

      expect(personEntityFromDb).toBeDefined();
      expect(personEntityFromDb).toBeInstanceOf(PersonEntity);

      const personEntityFromDbRaw = personEntityFromDb.get({ plain: true });
      expect(personEntityFromDbRaw.person_id).toEqual(personId.value);
      expect(personEntityFromDbRaw.user_id).toEqual(userId.value);
      expect(personEntityFromDbRaw.firstname).toEqual(person.firstname);
      expect(personEntityFromDbRaw.lastname).toEqual(person.lastname);
      expect(personEntityFromDbRaw.phone_number).toEqual(person.phoneNumber.value);
      expect(personEntityFromDbRaw.nickname).toEqual(person.nickname);
      expect(personEntityFromDbRaw.linkedin).toEqual(person.linkedin.value);
    };

    await expect(runSequelizeTransaction(sequelize, createPersonUsingEntity)).rejects.toThrow('rollback');
  });

  test('PersonMap.toDomain', () => {
    const personRepository = sequelize.getRepository(PersonEntity);
    const person = personRepository.build({
      person_id: PersonId.random(),
      user_id: UserId.random(),
      firstname: 'John',
      lastname: 'Doe',
      phone_number: PhoneNumber.fromString('+33600000000').value,
      linkedin: LinkedinProfileUrl.fromString('https://www.linkedin.com/in/johndoe/').value,
      google_place_id: randomString(60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'),
    });

    // PersonMap.toDomain(person: PersonEntity): Result<Person,Error>
    const mappedPersonResult = PersonMap.toDomain(person);
    const mappedPerson = mappedPersonResult._unsafeUnwrap();
    expect(mappedPersonResult.isOk()).toBeTruthy();
    expect(mappedPerson.id).toBeInstanceOf(PersonId);
    expect(mappedPerson.userId).toBeInstanceOf(UserId);
    expect(mappedPerson.firstname).toEqual('John');
    expect(mappedPerson.lastname).toEqual('Doe');
    expect(mappedPerson.phoneNumber).toBeInstanceOf(PhoneNumber);
    expect(mappedPerson.linkedin).toBeInstanceOf(LinkedinProfileUrl);
    expect(mappedPerson.googlePlaceId).toEqual(person.google_place_id);

    // PersonMap.toDomain(person: PersonRaw): Result<Person,Error>

    const personRaw: PersonRaw = {
      person_id: PersonId.random(),
      user_id: UserId.random(),
      firstname: 'Alice',
      lastname: 'Smith',
      phone_number: PhoneNumber.fromString('+33600000001').value,
      linkedin: LinkedinProfileUrl.fromString('https://www.linkedin.com/in/johndoe/').value,
      google_place_id: randomString(60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'),
    };

    const mappedPersonResult2 = PersonMap.toDomain(personRaw);
    const mappedPerson2 = mappedPersonResult2._unsafeUnwrap();
    expect(mappedPersonResult2.isOk()).toBeTruthy();
    expect(mappedPerson2.id).toBeInstanceOf(PersonId);
    expect(mappedPerson2.userId).toBeInstanceOf(UserId);
    expect(mappedPerson2.firstname).toEqual(personRaw.firstname);
    expect(mappedPerson2.lastname).toEqual(personRaw.lastname);
    expect(mappedPerson2.phoneNumber).toBeInstanceOf(PhoneNumber);
    expect(mappedPerson2.linkedin).toBeInstanceOf(LinkedinProfileUrl);
    expect(mappedPerson2.googlePlaceId).toEqual(personRaw.google_place_id);
  });

  test('PersonMap.toRawObject', () => {
    const userRaw: UserRaw = {
      user_id: UserId.random(),
      email: 'john.doe@example.com',
      type: Type.Customer,
    };

    const personId = PersonId.create();
    const userId = new UserId(userRaw.user_id);
    const person = new Person(
      personId,
      userId,
      'John',
      'Doe',
      PhoneNumber.fromString('+33600000000'),
      'John',
      LinkedinProfileUrl.fromString('https://www.linkedin.com/in/johndoe/'),
      randomString(60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'),
    );

    const personRaw = PersonMap.toRawObject(person);
    expect(personRaw).toBeDefined();
    expect(personRaw.person_id).toEqual(personId.value);
    expect(personRaw.user_id).toEqual(userId.value);
    expect(personRaw.firstname).toEqual('John');
    expect(personRaw.lastname).toEqual('Doe');
    expect(personRaw.phone_number).toEqual('+33600000000');
    expect(personRaw.linkedin).toEqual('https://www.linkedin.com/in/johndoe/');
    expect(personRaw.google_place_id).toEqual(person.googlePlaceId);
  });
});
