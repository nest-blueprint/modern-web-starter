import { NotFoundException } from './not-found.exception';
import { PricingPlanNotFoundError } from '../../domain/error/pricing-plan-not-found';

export class PricingPlanNotFoundException extends NotFoundException {
  readonly message = 'pricing plan not found';
  static readonly domainError: PricingPlanNotFoundError = { cause: 'pricing plan not found' };
  constructor(message?: string, metadata?: unknown) {
    super(message ?? PricingPlanNotFoundException.message, metadata, PricingPlanNotFoundException.domainError);
  }
}
