import { ConflictException } from './conflict.exception';
import { CustomerCreationFailedError } from '../../domain/error/customer-creation-failed';

export class CustomerCreationFailedException extends ConflictException {
  readonly message: 'customer already exists';
  static readonly domainError: CustomerCreationFailedError = { cause: 'customer creation failed' };
  constructor(message?: string, metadata?: unknown) {
    super(message ?? CustomerCreationFailedException.message, metadata, CustomerCreationFailedException.domainError);
  }
}
