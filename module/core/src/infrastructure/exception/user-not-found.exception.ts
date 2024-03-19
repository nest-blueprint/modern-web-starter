import { NotFoundException } from './not-found.exception';
import { UserNotFoundError } from '../../domain/error/user-not-found';

export class UserNotFoundException extends NotFoundException {
  readonly message: 'User not found';
  static readonly domainError: UserNotFoundError = { cause: 'user not found' };
  constructor(message?: string, metadata?: unknown) {
    super(message ?? UserNotFoundException.message, metadata, UserNotFoundException.domainError);
  }
}
