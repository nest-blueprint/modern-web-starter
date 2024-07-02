import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { routesV1 } from '../../../../config/routes-v1';
import { GetPricingPlanQuery } from '../../../application/query/get-pricing-plan.query';
import { QueryBus } from '@nestjs/cqrs';
import { TypedQueryParam } from '../../../infrastructure/http/param/decorator/typed-param.decorator';
import { uuidArrayTypeAssert } from '../../../infrastructure/http/assert/uuid-array-type.assert';

@Controller(routesV1.pricing_plan.root)
export class GetPricingPlanHttpHandler {
  constructor(private readonly queryBus: QueryBus) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async getPricingPlan(
    @TypedQueryParam({ name: 'mentor_id', type: 'uuid', nullable: false }) mentorId: string,
    @TypedQueryParam({ name: 'ids', type: 'any', nullable: false, assertFunction: uuidArrayTypeAssert }) ids: string[],
  ) {
    const getPricingPlanQuery = new GetPricingPlanQuery(mentorId, ids);
    const pricingPlans = await this.queryBus.execute(getPricingPlanQuery);

    return pricingPlans.map((pricingPlan) => ({
      id: pricingPlan.id.value,
      title: pricingPlan.title,
      course_type: pricingPlan.trainingType.value,
      price_currency: { currency: pricingPlan.rate.currency.code },
      price_amount: pricingPlan.rate.amount.value,
      rate_type: pricingPlan.pricingType.value,
    }));
  }
}
