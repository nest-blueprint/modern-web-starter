import { Id as PricingPlanId } from '../../../src/domain/pricing-plan/id';
import { Id as MentorId } from '../../../src/domain/mentor/id';
import { Type as TrainingType } from '../../../src/domain/training/type';
import { Money } from '../../../src/domain/money';
import { CurrencyCode } from '../../../src/domain/currency-code';
import { Type as PricingType } from '../../../src/domain/pricing/type';
import { PricingPlan } from '../../../src/domain/pricing-plan';

describe('[Core/Domain] PricingPlan', () => {
  test('should create a pricing plan', () => {
    const pricingPlanId = PricingPlanId.create();
    const mentorId = MentorId.create();
    const rate = Money.fromStringValues(30, CurrencyCode.EUR);
    const trainingType = TrainingType.fromString(TrainingType.Remote);
    const pricingType = new PricingType('hourly');
    const title = 'Remote hourly (1h)';

    const pricingPlan = new PricingPlan(pricingPlanId, mentorId, rate, trainingType, pricingType, title);

    expect(pricingPlan).toBeInstanceOf(PricingPlan);
  });

  test('instantiation should fail with every invalid argument provided', () => {
    const pricingPlanId = PricingPlanId.create();
    const mentorId = MentorId.create();
    const rate = Money.fromStringValues(30, CurrencyCode.EUR);
    const trainingType = TrainingType.fromString(TrainingType.Remote);
    const pricingType = new PricingType('hourly');
    const title = 'Remote hourly (1h)';

    expect(() => new PricingPlan(null, mentorId, rate, trainingType, pricingType, title)).toThrow();
    expect(() => new PricingPlan(pricingPlanId, null, rate, trainingType, pricingType, title)).toThrow();
    expect(() => new PricingPlan(pricingPlanId, mentorId, null, trainingType, pricingType, title)).toThrow();
    expect(() => new PricingPlan(pricingPlanId, mentorId, rate, null, pricingType, title)).toThrow();
    expect(() => new PricingPlan(pricingPlanId, mentorId, rate, trainingType, null, title)).toThrow();
    expect(() => new PricingPlan(pricingPlanId, mentorId, rate, trainingType, pricingType, null)).toThrow();
  });
});
