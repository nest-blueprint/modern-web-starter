import { PersonCreationFailedError } from '../../domain/error/person-creation-failed';
import { ConflictException } from './conflict.exception';

export class PersonCreationFailedException extends ConflictException {
  readonly message: 'Person creation failed';
  static readonly domainError: PersonCreationFailedError = {
    cause: 'person creation failed',
  };
  constructor(message?: string, metadata?: unknown) {
    super(message ?? PersonCreationFailedException.message, metadata, PersonCreationFailedException.domainError);
  }
}
