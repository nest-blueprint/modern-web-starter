import { CommandHandlerInterface } from '../../interface/command-handler.interface';
import { RegisterUserCommand } from '../register-user.command';
import { UserCollection } from '../../../domain/collection/user.collection';
import { Inject } from '@nestjs/common';
import { Id } from '../../../domain/user/id';
import { Email } from '../../../domain/user/email';
import { User } from '../../../domain/user';
import { UserAlreadyExistsException } from '../../../infrastructure/exception/user-already-exists.exception';
import { CommandHandler } from '@nestjs/cqrs';
import { UserCollectionToken } from '../../../infrastructure/repository/factory/token.factory';
import { Result } from 'neverthrow';
import { InvalidArgumentCommandException } from '../../exception/command/invalid-argument-command.exception';
import { Type } from '../../../domain/user/type';
import { Auth0UserId } from '../../../infrastructure/resource/auth0/type/auth0-user-id';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements CommandHandlerInterface {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(UserCollectionToken) private readonly users: UserCollection,
  ) {}

  async execute(command: RegisterUserCommand) {
    this.logger.debug(`RegisterUserHandler.execute`, { command });
    const { id, email, role, auth0Id } = this.getValueObjectFromCommand(command);

    const user = User.create(id, email, role);

    await this.addUserToRepository(user, auth0Id);

    this.logger.debug(`RegisterUserHandler.execute : success`);
  }

  private getValueObjectFromCommand(command: RegisterUserCommand) {
    try {
      const id = new Id(command.userId);
      const email = new Email(command.email);
      const role = Type.fromString(command.role);
      const auth0Id = new Auth0UserId(command.auth0UserId);
      return { id, email, role, auth0Id };
    } catch (error: any) {
      throw new InvalidArgumentCommandException(error.message, error);
    }
  }

  private async userExists(email: Email, id: Id): Promise<boolean> {
    this.logger.debug(`RegisterUserHandler.execute : check if user exists`, { email, id });
    return this.users.getByEmail(email).isOk() || this.users.get(id).isOk();
  }

  private async addUserToRepository(user: User, auth0Id: Auth0UserId) {
    this.logger.debug(`RegisterUserHandler.execute : add user to repository`, { user, auth0Id });
    if (await this.userExists(user.email, user.id)) {
      throw new UserAlreadyExistsException(`User already exists with email: ${user.email.value}`);
    }

    //@ts-expect-error overloaded method by the repository
    const result: Result<User, Error> = this.users.add(user, auth0Id);

    if (result.isErr()) {
      throw result.error;
    }
  }
}
