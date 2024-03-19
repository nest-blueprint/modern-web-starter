import { ConflictException } from './conflict.exception';
import { PricingPlanAlreadyExistsError } from '../../domain/error/pricing-plan-already-exists';

export class PricingPlanAlreadyExistException extends ConflictException {
  readonly message = 'pricing plan already exists';
  static readonly domainError: PricingPlanAlreadyExistsError = { cause: 'pricing plan already exists' };
  constructor(message?: string, metadata?: unknown) {
    super(message ?? PricingPlanAlreadyExistException.message, metadata, PricingPlanAlreadyExistException.domainError);
  }
}
