import { Injectable } from '@nestjs/common';
import { err, ok, Result } from 'neverthrow';
import { PricingPlanCollection } from '../../../src/domain/collection/pricing-plan.collection';
import { PricingPlan } from '../../../src/domain/pricing-plan';
import { Id as PricingPlanId } from '../../../src/domain/pricing-plan/id';
import { Id as MentorId } from '../../../src/domain/mentor/id';
import { PricingPlanAlreadyExistException } from '../../../src/infrastructure/exception/pricing-plan-already-exist.exception';
import { PricingPlanNotFoundException } from '../../../src/infrastructure/exception/pricing-plan-not-found.exception';
import { MentorNotFoundException } from '../../../src/infrastructure/exception/mentor-not-found.exception';

@Injectable()
export class InMemoryPricingPlanRepository implements PricingPlanCollection {
  private pricingPlans: Map<string, PricingPlan> = new Map();
  add(pricingPlan: PricingPlan): Result<PricingPlan, Error> {
    if (this.pricingPlans.has(pricingPlan.id.value)) {
      return err(new PricingPlanAlreadyExistException());
    } else {
      this.pricingPlans.set(pricingPlan.id.value, pricingPlan);
      return ok(pricingPlan);
    }
  }

  delete(pricingPlanId: PricingPlanId): Result<PricingPlan, Error> {
    if (!this.pricingPlans.has(pricingPlanId.value)) {
      return err(new PricingPlanNotFoundException());
    } else {
      const pricingPlan = this.pricingPlans.get(pricingPlanId.value);
      this.pricingPlans.delete(pricingPlanId.value);
      return ok(pricingPlan);
    }
  }

  find(id: PricingPlanId): Result<PricingPlan | null, Error> {
    if (this.pricingPlans.has(id.value)) {
      return ok(this.pricingPlans.get(id.value));
    }

    return ok(null);
  }

  getFromMentorId(mentorId: MentorId): Result<PricingPlan[], Error> {
    const pricingPlansFromMentor = Array.from(this.pricingPlans.values()).filter(
      (pricingPlan) => pricingPlan.mentorId.value === mentorId.value,
    );
    if (pricingPlansFromMentor.length === 0) {
      return err(new MentorNotFoundException());
    }
    const matchingPricingPlans = pricingPlansFromMentor.filter(
      (pricingPlan) => pricingPlan.mentorId.value === mentorId.value,
    );
    if (matchingPricingPlans.length === 0) {
      return err(new PricingPlanNotFoundException());
    }
    return ok(matchingPricingPlans);
  }

  update(pricingPlan: PricingPlan): Result<PricingPlan, Error> {
    if (!this.pricingPlans.has(pricingPlan.id.value)) {
      return err(new PricingPlanNotFoundException());
    } else {
      this.pricingPlans.set(pricingPlan.id.value, pricingPlan);
      return ok(pricingPlan);
    }
  }

  async count() {
    return Promise.resolve(this.pricingPlans.size);
  }

  clear() {
    this.pricingPlans.clear();
  }
}
