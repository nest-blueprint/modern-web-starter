import { Id as PricingPlanId } from './pricing-plan/id';
import { Id as MentorId } from '../domain/mentor/id';
import { Type as TrainingType } from '../domain/training/type';
import { Type as PricingType } from './pricing/type';
import { Money } from './money';
import assert from 'assert';

export class PricingPlan {
  static MinTitleLength = 1;
  static MaxTitleLength = 100;

  constructor(
    private readonly _id: PricingPlanId,
    private readonly _mentorId: MentorId,
    private readonly _rate: Money,
    private readonly _trainingType: TrainingType,
    private readonly _pricingType: PricingType,
    private readonly _title: string,
  ) {
    assert(this._id instanceof PricingPlanId, 'must be an instance of PricingPlanId');
    assert(this._mentorId instanceof MentorId, 'must be an instance of MentorId');
    assert(this._rate instanceof Money, 'must be an instance of Money');
    assert(this._trainingType instanceof TrainingType, 'must be an instance of TrainingType');
    assert(this._pricingType instanceof PricingType, 'must be an instance of PricingType');
    assert(typeof this._title === 'string', 'title must be a string');
    assert(
      this._title.length <= PricingPlan.MaxTitleLength,
      `title must be less than ${PricingPlan.MaxTitleLength} characters`,
    );
    assert(
      this._title.length >= PricingPlan.MinTitleLength,
      `title must be more than ${PricingPlan.MinTitleLength} characters`,
    );
  }

  get id(): PricingPlanId {
    return this._id;
  }

  get mentorId(): MentorId {
    return this._mentorId;
  }

  get rate() {
    return this._rate;
  }

  get trainingType(): TrainingType {
    return this._trainingType;
  }

  get pricingType(): PricingType {
    return this._pricingType;
  }

  get title(): string {
    return this._title;
  }
}
