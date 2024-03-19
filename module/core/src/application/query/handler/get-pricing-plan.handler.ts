import { Inject } from '@nestjs/common';
import { QueryHandlerInterface } from '../../interface/query-handler.interface';
import { PricingPlan } from '../../../domain/pricing-plan';
import { GetPricingPlanQuery } from '../get-pricing-plan.query';
import { Id as MentorId } from '../../../domain/mentor/id';
import { Id as PricingPlanId } from '../../../domain/pricing-plan/id';
import { PricingPlanCollection } from '../../../domain/collection/pricing-plan.collection';
import { PricingPlanCollectionToken } from '../../../infrastructure/repository/factory/token.factory';
import { QueryHandler } from '@nestjs/cqrs';
import { Result } from 'neverthrow';
import { InvalidValueProvidedException } from '../../../infrastructure/exception/invalid-value-provided.exception';
import { PricingPlanNotFoundException } from '../../../infrastructure/exception/pricing-plan-not-found.exception';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@QueryHandler(GetPricingPlanQuery)
export class GetPricingPlanHandler implements QueryHandlerInterface {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(PricingPlanCollectionToken) private readonly repository: PricingPlanCollection,
  ) {}

  async execute(query: GetPricingPlanQuery): Promise<PricingPlan[]> {
    this.logger.debug('GetPricingPlanHandler.execute', { query });
    const mentorId = new MentorId(query.mentorId);
    const pricingPlanIds = query.pricingPlansIds.map((id) => new PricingPlanId(id));
    if (pricingPlanIds.length === 0) {
      throw new InvalidValueProvidedException('At least one pricing plan id is required');
    }
    const pricingPlans: Result<Array<PricingPlan>, Error> = await this.repository.getFromMentorId(mentorId);
    if (pricingPlans.isErr()) {
      throw pricingPlans.error;
    }
    const requestedPricingPlans = pricingPlans.value.filter((pricingPlan) =>
      pricingPlanIds.map((id) => id.value).includes(pricingPlan.id.value),
    );
    if (requestedPricingPlans.length === 0) {
      throw new PricingPlanNotFoundException(`No pricing plan found for mentor: ${mentorId.value}`);
    }
    this.logger.debug('GetPricingPlanHandler.execute : success', { pricingPlans: requestedPricingPlans });
    return requestedPricingPlans;
  }
}
