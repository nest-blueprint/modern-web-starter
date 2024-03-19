import { Exclude, plainToInstance, Transform } from 'class-transformer';
import { User as UserEntity } from '../sequelize/entity/user.entity';
import { Datetime } from '../type/datetime.type';
import { Email } from '../../domain/user/email';
import { Mentor } from '../sequelize/entity/mentor.entity';
import { Person } from '../sequelize/entity/person.entity';
import { Id } from '../../domain/user/id';
import { User } from '../../domain/user';
import { User as UserRaw } from '../type/raw/user.raw';
import { PersonMap } from './person.map';
import { err, ok, Result } from 'neverthrow';
import { RuntimeErrorException } from '../exception/runtime-error.exception';
import { Type } from '../../domain/user/type';
import { Auth0UserId } from '../resource/auth0/type/auth0-user-id';

export class UserMap {
  @Transform(({ value }) => {
    return new Datetime(value.toISOString());
  })
  created_at: Date;

  @Transform(({ value }) => new Email(value))
  email: string;

  @Exclude()
  mentor: Mentor;

  @Transform(({ value }) => PersonMap.toDomain(value))
  person: Person;

  @Exclude()
  updated_at: Date;

  @Transform(({ value }) => new Id(value))
  user_id: string;

  @Transform(({ value }) => new Type(value))
  type: Type;

  @Transform(({ value }) => new Auth0UserId(value))
  auth0_id: Auth0UserId;

  static toDomain(user: UserRaw): Result<User, Error>;
  static toDomain(user: UserEntity): Result<User, Error>;
  static toDomain(user: UserEntity | UserRaw): Result<User, Error> {
    try {
      if (user instanceof UserEntity) {
        const mappedUserData = plainToInstance(UserMap, user.dataValues);

        const { user_id, email, type } = <never>mappedUserData || {};
        const mappedUser = new User(user_id, email, type);
        return ok(mappedUser);
      }
      if (UserMap.containsNeededKeys(user)) {
        const id = new Id(user.user_id);
        const email = new Email(user.email);
        const userType = new Type(user.type);
        const personResult = user?.person ? PersonMap.toDomain(user.person) : undefined;
        if (personResult && personResult.isErr()) {
          return err(
            new RuntimeErrorException('Failed to map user. Unexpected exception while trying to map the person', {
              method: 'UserMap.toDomain',
              input: user,
            }),
          );
        }
        if (personResult && personResult.isOk()) {
          const person = personResult.value;
          const mappedUser = new User(id, email, userType, person);
          return ok(mappedUser);
        }

        const mappedUser = new User(id, email, userType);
        return ok(mappedUser);
      }
      return err(new RuntimeErrorException('Failed to map user.', { method: 'UserMap.toDomain', input: user }));
    } catch (error: any) {
      return err(new RuntimeErrorException('Failed to map user.', { error, method: 'UserMap.toDomain', input: user }));
    }
  }

  private static containsNeededKeys(user: UserRaw) {
    if (['user_id', 'email', 'type'].every((key) => Object.keys(user).includes(key))) {
      return true;
    }
  }

  static toJSON(user: User) {
    return {
      user_id: user.id.value,
      type: user.userType.value,
      email: user.email.value,
      person: user.person ? PersonMap.toJSON(user.person) : undefined,
    };
  }

  static toEntity(user: User, auth0UserId: Auth0UserId): UserEntity {
    const userEntity = plainToInstance(UserEntity, UserMap.toJSON(user));
    userEntity.auth0_id = auth0UserId.value;
    return userEntity;
  }

  static toRaw(user: User): UserRaw {
    return {
      user_id: user.id.value,
      email: user.email.value,
      type: user.userType.value,
      person: user.person ? PersonMap.toRawObject(user.person) : undefined,
    };
  }
}
