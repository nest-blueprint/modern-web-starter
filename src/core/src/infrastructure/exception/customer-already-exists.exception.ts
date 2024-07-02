import { CustomerAlreadyExistsError } from '../../domain/error/customer-already-exists';
import { ConflictException } from './conflict.exception';

export class CustomerAlreadyExistsException extends ConflictException {
  readonly message: 'customer already exists';
  static readonly domainError: CustomerAlreadyExistsError = { cause: 'customer already exists' };
  constructor(message?: string, metadata?: unknown) {
    super(message ?? CustomerAlreadyExistsException.message, metadata, CustomerAlreadyExistsException.domainError);
  }
}
