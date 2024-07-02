import { Inject, Injectable } from '@nestjs/common';
import { UserCollection } from '../../domain/collection/user.collection';
import { Err, err, Ok, ok, Result } from 'neverthrow';
import { User } from '../../domain/user';
import { Id } from '../../domain/user/id';
import { Email } from '../../domain/user/email';
import { UserNotFoundException } from '../exception/user-not-found.exception';
import { RuntimeErrorException } from '../exception/runtime-error.exception';
import { UserAlreadyExistsException } from '../exception/user-already-exists.exception';
import { User as UserEntity } from '../sequelize/entity/user.entity';
import { UserMap } from '../map/user.map';
import { Repository, Sequelize } from 'sequelize-typescript';
import { SequelizeToken } from '../sequelize/token/sequelize.token';
import { storage } from '../storage/storage';
import { Transaction } from 'sequelize';
import { Auth0UserId } from '../resource/auth0/type/auth0-user-id';
import { cleanObject, match } from '../util/function.util';
import { databaseSpecs } from '../sequelize/specs/database.specs';
import { UserRepositoryInterface } from './interface/user-repository.interface';

@Injectable()
export class UserRepository implements UserCollection, UserRepositoryInterface {
  private readonly users: Repository<UserEntity>;
  constructor(@Inject(SequelizeToken) private readonly sequelize: Sequelize) {
    this.users = this.sequelize.getRepository(UserEntity);
  }

  async findOneByEmail(email: Email): Promise<Result<User | null, Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const result = await this.users.findOne({
        where: {
          email: email.value,
        },
        include: [
          {
            model: this.sequelize.model(databaseSpecs.person.modelName),
          },
        ],
        transaction,
      });

      if (!result) return ok(null);

      const mappedUserResult = UserMap.toDomain(result);
      if (mappedUserResult.isErr()) return err(mappedUserResult.error);

      return ok(mappedUserResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async getByEmail(email: Email): Promise<Result<User, Error>> {
    try {
      const userFromDatabase = await this.findOneByEmail(email);

      if (userFromDatabase.isErr() || userFromDatabase.value === null) {
        return err(new UserNotFoundException(`User with email ${email.value} not found.`, userFromDatabase));
      }

      return ok(userFromDatabase.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  // Repository take into account the auth0 id, required and stored in the database
  async add(user: User): Promise<Result<User, Error>>;
  async add(user: User, auth0Id?: Auth0UserId): Promise<Result<User, Error>> {
    const transaction = storage.getStore() as Transaction;

    try {
      const userInDatabaseWithSameId = await this.users.findByPk(user.id.value, { transaction });

      const userInDatabaseWithSameEmail = await this.users.findOne({
        transaction,
        where: {
          email: user.email.value,
        },
      });

      const auth0_id = auth0Id.value;

      const userInDatabaseWithSameAuth0Id = await this.users.findOne({
        transaction,
        where: {
          auth0_id,
        },
      });

      if (userInDatabaseWithSameId || userInDatabaseWithSameEmail || userInDatabaseWithSameAuth0Id) {
        return err(new UserAlreadyExistsException('User with same records already exists.'));
      }
      const userEntity = UserMap.toEntity(user, auth0Id);
      userEntity.auth0_id = auth0_id;
      const result = await userEntity.save({ transaction });
      const mappedNewUserResult = UserMap.toDomain(result);

      return match(mappedNewUserResult, {
        success: (user) => ok(user),
        failure: (error) => err(error),
      });
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async get(idParam: Id): Promise<Result<User, Error>> {
    const transaction = storage.getStore() as Transaction;

    try {
      const userFromDb = await this.users.findByPk(idParam.value, {
        transaction,
        include: [
          {
            model: this.sequelize.model(databaseSpecs.person.modelName),
          },
        ],
      });

      if (!userFromDb) {
        return err(new UserNotFoundException(`User with id ${idParam.value} not found.`));
      }

      const newUser = UserMap.toDomain(userFromDb);

      if (newUser.isErr()) return err(newUser.error);

      return ok(newUser.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async delete(id: Id): Promise<Result<User, Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const userFromDatabase = await this.users.findByPk(id.value, { transaction });

      if (!userFromDatabase) {
        return err(new UserNotFoundException(`User with id ${id.value} not found.`));
      }

      await this.users.destroy({
        where: {
          user_id: id.value,
        },
        transaction,
      });

      const mappedUserDeletedResult = UserMap.toDomain(userFromDatabase);

      if (mappedUserDeletedResult.isErr()) return err(mappedUserDeletedResult.error);

      return ok(mappedUserDeletedResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async update(user: User): Promise<Result<User, Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const userFromDatabase = await this.users.findByPk(user.id.value, {
        transaction,
        include: [
          {
            model: this.sequelize.model(databaseSpecs.person.modelName),
          },
        ],
      });

      if (!userFromDatabase) {
        return err(new UserNotFoundException(`User with id ${user.id.value} not found.`));
      }

      const userJson = UserMap.toJSON(user);
      cleanObject(UserMap.toJSON(user));
      //@ts-expect-error typing error
      await userFromDatabase.update({ ...userJson }, { transaction });

      const result = await userFromDatabase.save({ transaction });
      const updatedUserResult = UserMap.toDomain(result);

      if (updatedUserResult.isErr()) return err(updatedUserResult.error);

      return ok(updatedUserResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async find(ids: Id[]): Promise<Result<User[], Error>> {
    const transaction = storage.getStore() as Transaction;

    try {
      if (ids.length === 0) return ok([]);

      const where = ids.length > 0 ? { user_id: ids.map((id) => id.value) } : {};
      const usersFromDb = await this.users.findAll({
        where,
        transaction,
        include: [
          {
            model: this.sequelize.model(databaseSpecs.person.modelName),
          },
        ],
      });

      if (usersFromDb.length === 0) {
        return ok([]);
      }

      const users = usersFromDb.map((userFromDb) => UserMap.toDomain(userFromDb));

      if (users.some((user) => user.isErr())) {
        const errorResults = users.filter((user) => user.isErr()) as Err<User, Error>[];
        const errors = errorResults.map((errorResult) => errorResult.error);
        return err(
          new RuntimeErrorException('Cannot map user from database.', {
            errors,
          }),
        );
      }

      return ok(users.map((user) => user.unwrapOr(null)));
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async getUserByAuth0Id(auth0UserId: Auth0UserId): Promise<Result<User, Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const userFromDatabase = await this.users.findOne({
        where: {
          auth0_id: auth0UserId.value,
        },
        include: this.getNestedEntities(),
        transaction,
      });

      if (!userFromDatabase) {
        return err(new UserNotFoundException(`User with auth id ${auth0UserId.value} not found.`));
      }

      const mappedUserResult = UserMap.toDomain(userFromDatabase);

      if (mappedUserResult.isErr()) return err(mappedUserResult.error);

      return ok(mappedUserResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async count(): Promise<Result<number, Error>> {
    const transaction = storage.getStore() as Transaction;

    try {
      const count = await this.users.count({ transaction });
      return ok(count);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  private getNestedEntities() {
    return [
      { model: this.sequelize.model(databaseSpecs.person.modelName) },
      { model: this.sequelize.model(databaseSpecs.customer.modelName) },
      { model: this.sequelize.model(databaseSpecs.mentor.modelName) },
    ];
  }
}
