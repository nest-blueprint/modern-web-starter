import { ConflictException } from './conflict.exception';
import { UserCreationFailedError } from '../../domain/error/user-creation-failed';

export class UserCreationFailedException extends ConflictException {
  readonly message = 'User creation failed';
  static readonly domainError: UserCreationFailedError = { cause: 'user creation failed' };
  constructor(message?: string, metadata?: unknown) {
    super(message ?? UserCreationFailedException.message, metadata, UserCreationFailedException.domainError);
  }
}
