import { PersonNotFoundError } from '../../domain/error/person-not-found';
import { NotFoundException } from './not-found.exception';

export class PersonNotFoundException extends NotFoundException {
  readonly message: 'person not found';
  static readonly domainError: PersonNotFoundError = { cause: 'person not found' };
  constructor(message?: string, metadata?: unknown) {
    super(message ?? PersonNotFoundException.message, metadata, PersonNotFoundException.domainError);
  }
}
