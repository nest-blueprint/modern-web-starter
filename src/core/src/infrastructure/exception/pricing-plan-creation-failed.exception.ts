import { PricingPlanCreationFailedError } from '../../domain/error/pricing-plan-creation-failed';
import { ConflictException } from './conflict.exception';

export class PricingPlanCreationFailedException extends ConflictException {
  readonly message = 'pricing plan creation failed';
  static readonly domainError: PricingPlanCreationFailedError = { cause: 'pricing plan creation failed' };
  constructor(message: string, metadata?: any) {
    super(
      message ?? PricingPlanCreationFailedException.message,
      metadata,
      PricingPlanCreationFailedException.domainError,
    );
  }
}
