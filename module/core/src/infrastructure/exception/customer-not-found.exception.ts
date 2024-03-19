import { NotFoundException } from './not-found.exception';
import { CustomerNotFoundError } from '../../domain/error/customer-not-found';

export class CustomerNotFoundException extends NotFoundException {
  readonly message: 'customer not found';
  static readonly domainError: CustomerNotFoundError = { cause: 'customer not found' };
  constructor(message?: string, metadata?: unknown) {
    super(message ?? CustomerNotFoundException.message, metadata, CustomerNotFoundException.domainError);
  }
}
