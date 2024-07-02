import { UserAlreadyExistsError } from '../../domain/error/user-already-exists';
import { ConflictException } from './conflict.exception';

export class UserAlreadyExistsException extends ConflictException {
  readonly message: 'user already exists';
  static readonly domainError: UserAlreadyExistsError = { cause: 'user already exists' };
  constructor(message?: string, metadata?: unknown) {
    super(message ?? UserAlreadyExistsException.message, metadata, UserAlreadyExistsException.domainError);
  }
}
