import { PricingPlan } from '../pricing-plan';
import { Id as MentorId } from '../mentor/id';

import { Id as PricingPlanId } from '../pricing-plan/id';

export interface PricingPlanCollection {
  add(pricingPerCourse: PricingPlan): any;
  delete(id: PricingPlanId): any;
  getFromMentorId(mentorId: MentorId): any;
  find(id: PricingPlanId): any;
  update(PricingPerCourse): any;
}
