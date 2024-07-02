import { Inject } from '@nestjs/common';
import { Result } from 'neverthrow';
import { CreatePersonCommand } from '../create-person.command';
import { Person } from '../../../domain/person';
import { PhoneNumber } from '../../../domain/person/phone-number';
import { Id as PersonId } from '../../../domain/person/id';
import { Id as UserId } from '../../../domain/user/id';
import { PersonCollection } from '../../../domain/collection/person.collection';
import { CommandHandlerInterface } from '../../interface/command-handler.interface';
import { CommandHandler } from '@nestjs/cqrs';
import { PersonCollectionToken } from '../../../infrastructure/repository/factory/token.factory';
import { LinkedinProfileUrl } from '../../../infrastructure/type/linkedin-profile-url.type';
import { InvalidArgumentCommandException } from '../../exception/command/invalid-argument-command.exception';
import { PersonAlreadyExistsException } from '../../../infrastructure/exception/person-already-exists.exception';
import { RuntimeErrorException } from '../../../infrastructure/exception/runtime-error.exception';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@CommandHandler(CreatePersonCommand)
export class CreatePersonHandler implements CommandHandlerInterface {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(PersonCollectionToken)
    private readonly personRepository: PersonCollection,
  ) {}

  async execute(command: CreatePersonCommand) {
    this.logger.debug(`CreatePersonHandler.execute`, { command });
    const person = this.createPersonObject(command);
    await this.addPersonToRepository(person);

    this.logger.debug(`CreatePersonHandler.execute : success`);
  }

  private getValueObjectsFromCommand(command: CreatePersonCommand) {
    try {
      return {
        personId: new PersonId(command.persondId),
        userId: new UserId(command.userId),
        phoneNumber: command.phone ? PhoneNumber.fromString(command.phone) : undefined,
        linkedin: command.linkedin ? new LinkedinProfileUrl(command.linkedin) : undefined,
      };
    } catch (error: any) {
      throw new InvalidArgumentCommandException(error.message, error);
    }
  }

  private createPersonObject(command: CreatePersonCommand) {
    this.logger.debug(`CreatePersonHandler.execute : create person`);
    try {
      const { personId, userId, phoneNumber, linkedin } = this.getValueObjectsFromCommand(command);
      return new Person(
        personId,
        userId,
        command.firstname,
        command.lastname,
        phoneNumber,
        command.googlePlaceId,
        linkedin,
      );
    } catch (error: any) {
      throw new InvalidArgumentCommandException(error.message, error);
    }
  }

  private async addPersonToRepository(person: Person) {
    this.logger.debug(`CreatePersonHandler.execute : add person to the repository`);
    if (await this.personAlreadyExists(person.id)) {
      throw new PersonAlreadyExistsException(`Person with id ${person.id.value} already exists.`);
    }
    const commandResult: Result<Person, Error> = await this.personRepository.add(person);
    if (commandResult.isErr()) {
      throw new RuntimeErrorException('Cannot create person ' + person.id.value, commandResult.error);
    }
  }

  private async personAlreadyExists(personId: PersonId): Promise<boolean> {
    this.logger.debug(`CreatePersonHandler.execute : check if person already exists`);
    const personResult = await this.personRepository.get(personId);
    return personResult.isOk();
  }
}
