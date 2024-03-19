import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { ConfigLoaderToken } from '../../../../src/infrastructure/init/token.init';
import { appConfig } from '../../../../../../config/autoload/app.config';
import { ConfigLoaderService } from '../../../../src/infrastructure/init/service/config-loader.service';
import { SequelizeProvider } from '../../../../src/infrastructure/sequelize/sequelize.provider';
import { User as UserEntity } from '../../../../../core/src/infrastructure/sequelize/entity/user.entity';
import { Id as UserId } from '../../../../../core/src/domain/user/id';
import { SequelizeToken } from '../../../../src/infrastructure/sequelize/token/sequelize.token';
import { UserMap } from '../../../../src/infrastructure/map/user.map';
import { Email } from '../../../../src/domain/user/email';
import { User } from '../../../../src/domain/user';
import { User as UserRaw } from '../../../../src/infrastructure/type/raw/user.raw';
import { isEmail, isUUID } from 'class-validator';
import { Type } from '../../../../src/domain/user/type';
import { randomBetween } from '../../../double/provider/external/auth0/util/auth0.util';
import { Auth0UserId } from '../../../../src/infrastructure/resource/auth0/type/auth0-user-id';
import { Transaction } from 'sequelize';
import { runSequelizeTransaction } from '../../util';

describe('[Core/Infrastructure] UserMap', () => {
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

  test('UserMap.toEntity', async () => {
    const userRepository = sequelize.getRepository(UserEntity);

    // Safest way to test if UserMap.toEntity is working is to create a user in the database using it.

    const userRaw: UserRaw & { auth0_id: string } = {
      user_id: UserId.random(),
      email: 'john.doe@example.com',
      type: Type.Customer,
      auth0_id: `auth0|${randomBetween(100000000000, 999999999999)}`,
    };

    const id = UserId.create();
    const email = new Email(userRaw.email);
    const userType = Type.fromString(Type.Customer);
    const auth0Id = new Auth0UserId(userRaw.auth0_id);
    const user = User.create(id, email, userType);

    const userEntity = UserMap.toEntity(user, auth0Id);

    const createUserUsingEntity = async (transaction: Transaction) => {
      await userEntity.save({ transaction });
      const userFromDatabase = await userRepository.findByPk(userEntity.user_id, { transaction });

      expect(userFromDatabase).toBeDefined();
      expect(userFromDatabase).toBeInstanceOf(UserEntity);

      const userFromDatabaseRaw = userFromDatabase.get({ plain: true });

      expect(userFromDatabaseRaw.user_id).toEqual(userEntity.user_id);

      await expect(runSequelizeTransaction(sequelize, createUserUsingEntity)).rejects.toThrow('rollback');
    };
  });

  test('UserMap.toDomain', () => {
    const userRepository = sequelize.getRepository(UserEntity);
    const userRaw: UserRaw & { auth0_id: string } = {
      user_id: UserId.random(),
      email: 'john.doe@example.com',
      type: Type.Customer,
      auth0_id: `auth0|${randomBetween(100000000000, 999999999999)}`,
    };
    //@ts-expect-error avoid typing issues
    const userSequelize = userRepository.build({
      ...userRaw,
      created_at: new Date(Date.now()),
      updated_at: new Date(Date.now()),
    });

    // UserMap.toDomain(param:UserEntity): Result<User,Error>

    const userResult = UserMap.toDomain(userSequelize);
    expect(userResult.isOk()).toBeTruthy();
    const user = userResult._unsafeUnwrap();

    expect(user.id).toBeInstanceOf(UserId);
    expect(user.email).toBeInstanceOf(Email);
    expect(user.userType).toBeInstanceOf(Type);
    expect(user.userType.value === userRaw.type).toBeTruthy();

    // UserMap.toDomain(param:UserRaw): Result<User,Error>

    const userDomainFromRawUserResult = UserMap.toDomain(userRaw);
    expect(userDomainFromRawUserResult.isOk()).toBeTruthy();
    const userDomainFromRawUser = userDomainFromRawUserResult._unsafeUnwrap();

    expect(userDomainFromRawUser).toBeInstanceOf(User);
    expect(userDomainFromRawUser.id).toBeInstanceOf(UserId);
    expect(userDomainFromRawUser.email).toBeInstanceOf(Email);
    expect(userDomainFromRawUser.userType).toBeInstanceOf(Type);
    expect(userDomainFromRawUser.userType.value === userRaw.type).toBeTruthy();

    expect(userDomainFromRawUser.id.value).toEqual(userRaw.user_id);
    expect(userDomainFromRawUser.email.value).toEqual(userRaw.email);
    expect(userDomainFromRawUser.userType.value).toEqual(userRaw.type);
  });

  test('UserMap.toRaw', async () => {
    const userType = Type.fromString('customer');
    const user = User.create(UserId.create(), Email.fromString('john.doe@example.com'), userType);
    const rawUser = UserMap.toRaw(user);
    expect(isUUID(rawUser.user_id, 4)).toBeTruthy();
    expect(new Type(rawUser.type).equals(userType)).toBeTruthy();
    expect(isEmail(rawUser.email)).toBeTruthy();
  });
});
