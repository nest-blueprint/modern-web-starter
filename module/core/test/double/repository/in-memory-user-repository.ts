import { UserCollection } from '../../../src/domain/collection/user.collection';
import { User } from '../../../src/domain/user';
import { err, ok, Result } from 'neverthrow';
import { Email } from '../../../src/domain/user/email';
import { Id } from '../../../src/domain/user/id';
import { Inject, Injectable } from '@nestjs/common';
import { UserAlreadyExistsException } from '../../../src/infrastructure/exception/user-already-exists.exception';
import { UserNotFoundException } from '../../../src/infrastructure/exception/user-not-found.exception';
import { UserRecord } from '../type/record/user.record';
import { Auth0UserId } from '../../../src/infrastructure/resource/auth0/type/auth0-user-id';
import { UserRepositoryInterface } from '../../../src/infrastructure/repository/interface/user-repository.interface';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class InMemoryUserRepository implements UserCollection, UserRepositoryInterface {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}
  private users: Map<string, UserRecord> = new Map<string, UserRecord>();

  add(user: User, auth0Id?: Auth0UserId): Result<User, Error> {
    this.logger.debug(`InMemoryUserRepository.add: execute - ${user.id.value}`, { user, auth0Id });
    //@ts-expect-error overload method with auth0Id
    if (!this.userExists(user, auth0Id)) {
      this.users.set(user.id.value, { user, auth0Id });
      this.logger.debug(`InMemoryUserRepository.add: ${user.id.value} - success`, { user, auth0Id });
      this.logger.debug(`InMemoryUserRepository: contains ${this.users.size} `, { users: this.users });
      return ok(user);
    }
    const error = new UserAlreadyExistsException(`Cannot add the user ${user.email.value} because it already exists`);
    this.logger.debug(`InMemoryUserRepository.add: ${user.id.value} - failure`, { user, auth0Id, error });
    return err(error);
  }

  delete(id: Id): Result<User, Error> {
    this.logger.debug(`InMemoryUserRepository.delete: execute - ${id.value}`, { id });
    if (this.userExists(id)) {
      const user = this.users.get(id.value);
      this.users.delete(id.value);
      this.logger.debug(`InMemoryUserRepository.delete: ${id.value} - success`, { id });
      this.logger.debug(`InMemoryUserRepository: contains ${this.users.size} `, { users: this.users });
      return ok(user.user);
    }
    this.logger.debug(`InMemoryUserRepository.delete: ${id.value} - failure`, { id });
    return err(new UserNotFoundException(`Cannot delete the user with id ${id.value}. User not found.`));
  }

  findOneByEmail(email: Email): Result<User | null, Error> {
    this.logger.debug(`InMemoryUserRepository.findOneByEmail: execute - ${email.value}`, { email });
    const user = [...this.users.values()].find((userRecord) => userRecord.user.email.value === email.value);
    if (user) {
      this.logger.debug(`InMemoryUserRepository.findOneByEmail: ${email.value} - success`, { email });
      this.logger.debug(`InMemoryUserRepository: contains ${this.users.size} `, { users: this.users });
      return ok(user.user);
    }
    this.logger.debug(`InMemoryUserRepository.findOneByEmail: ${email.value} - not found`, { email });
    return ok(null);
  }

  update(user: User): Result<User, Error> {
    this.logger.debug(`InMemoryUserRepository.update: execute - ${user.id.value}`, { user });
    if (!this.userExists(user)) {
      return err(new UserNotFoundException(`Cannot update the user with id ${user.id.value}. User not found.`));
    }
    const userRecord = this.users.get(user.id.value);
    this.users.set(user.id.value, { ...userRecord, user });
    this.logger.debug(`InMemoryUserRepository.update: ${user.id.value} - success`, { user });
    this.logger.debug(`InMemoryUserRepository: contains ${this.users.size} `, { users: this.users });
    return ok(user);
  }

  find(ids: Id[]): Result<User[], Error> {
    this.logger.debug(`InMemoryUserRepository.find: execute - ${ids.map((id) => id.value)}`, { ids });
    const users = [...this.users.values()].filter((storedUserRecord) => ids.includes(storedUserRecord.user.id));
    const usersIds = users.map((userRecord) => userRecord.user);
    this.logger.debug(`InMemoryUserRepository.find: ${usersIds.map((id) => id)} - success`, { ids });
    this.logger.debug(`InMemoryUserRepository: contains ${this.users.size} `, { users: this.users });
    return ok(usersIds);
  }

  get(id: Id): Result<User, Error> {
    this.logger.debug(`InMemoryUserRepository.get: execute - ${id.value}`, { id });
    if (!this.userExists(id)) {
      this.logger.debug(`InMemoryUserRepository.get: ${id.value} - failure`, { id });
      return err(new UserNotFoundException(`Cannot get the user with id ${id.value}. User not found.`));
    }
    const userRecord = this.users.get(id.value);
    this.logger.debug(`InMemoryUserRepository.get: ${id.value} - success`, { id });
    this.logger.debug(`InMemoryUserRepository: contains ${this.users.size} `, { users: this.users });
    return ok(userRecord.user);
  }

  getByEmail(email: Email): Result<User, Error> {
    if (!this.userExists(email)) {
      this.logger.debug(`InMemoryUserRepository.getByEmail: ${email.value} - failure`, { email });
      return err(new UserNotFoundException(`Cannot get the user with email ${email.value}. User not found.`));
    }
    const userRecord = [...this.users.values()].find((userRecord) => userRecord.user.email.value === email.value);
    this.logger.debug(`InMemoryUserRepository.getByEmail: ${email.value} - success`, { email });
    this.logger.debug(`InMemoryUserRepository: contains ${this.users.size} `, { users: this.users });
    return ok(userRecord.user);
  }

  getUserByAuth0Id(auth0UserId: Auth0UserId): Result<User, Error> {
    this.logger.debug(`InMemoryUserRepository.getUserByAuth0Id: execute - ${auth0UserId.value}`, { auth0UserId });

    const userRecord = [...this.users.values()].find((u) => u.auth0Id.value === auth0UserId.value);
    if (userRecord) {
      this.logger.debug(`InMemoryUserRepository.getUserByAuth0Id: ${auth0UserId.value} - success`, { auth0UserId });
      this.logger.debug(`InMemoryUserRepository: contains ${this.users.size} `, { users: this.users });
      return ok(userRecord.user);
    } else {
      this.logger.debug(`InMemoryUserRepository.getUserByAuth0Id: ${auth0UserId.value} - failure`, { auth0UserId });
      return err(new UserNotFoundException(`Cannot get the user with auth0Id ${auth0UserId.value}. User not found.`));
    }
  }

  count(): Result<number, Error> {
    this.logger.debug(`InMemoryUserRepository.count: execute`);
    return ok(this.users.size);
  }

  clear(): void {
    this.logger.debug(`InMemoryUserRepository.clear: execute`);
    this.users.clear();
  }

  private userExists(id: Id): boolean;
  private userExists(user: User): boolean;
  private userExists(email: Email): boolean;
  private userExists(argument: User | Id | Email, auth0Id?: Auth0UserId): boolean {
    this.logger.debug(`InMemoryUserRepository.userExists: execute`, { argument });
    this.logger.debug(`InMemoryUserRepository: contains ${this.users.size} `, { users: this.users });
    if (argument instanceof Email) {
      return [...this.users.values()].some((userRecord) => userRecord.user.email.value === argument.value);
    }
    if (argument instanceof User) {
      const idAlreadyExists = this.users.has(argument.id.value);
      const emailAlreadyExists = !![...this.users.values()].find(
        (userRecord) => userRecord.user.email.value === argument.email.value,
      );

      const auth0IdAlreadyExists = !![...this.users.values()].find((u) => u.auth0Id.value === auth0Id.value);
      this.logger.debug(
        `InMemoryUserRepository.userExists: ${idAlreadyExists || emailAlreadyExists || auth0IdAlreadyExists}`,
        { argument },
      );
      return idAlreadyExists || emailAlreadyExists || auth0IdAlreadyExists;
    }
    return this.users.has(argument.value);
  }
}
