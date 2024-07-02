import { PersonAlreadyExistsError } from '../../domain/error/person-already-exists';
import { ConflictException } from './conflict.exception';

export class PersonAlreadyExistsException extends ConflictException {
  readonly message: 'person already exists';
  static readonly domainError: PersonAlreadyExistsError = {
    cause: 'person already exists',
  };
  constructor(message?: string, metadata?: unknown) {
    super(message ?? PersonAlreadyExistsException.message, metadata, PersonAlreadyExistsException.domainError);
  }
}
