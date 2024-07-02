import { Exclude, plainToInstance, Transform, Type } from 'class-transformer';
import { PricingPlan as PricingPlanEntity } from '../sequelize/entity/pricing-plan.entity';
import { Mentor as MentorEntity } from '../sequelize/entity/mentor.entity';
import { Id as MentorId } from '../../domain/mentor/id';
import { Id as PricingPlanId } from '../../domain/pricing-plan/id';
import { Currency } from '../type/money/currency';
import { Amount } from '../type/money/amount';
import { PricingTypeEnumValues, Type as PricingType } from '../../domain/pricing/type';
import { TrainingTypeEnumValues, Type as TrainingType } from '../../domain/training/type';
import { PricingPlan } from '../../domain/pricing-plan';
import { Money } from '../../domain/money';
import { PricingPlan as PricingPlanRaw } from '../type/raw/pricing-plan.raw';
import { err, ok, Result } from 'neverthrow';
import { RuntimeErrorException } from '../exception/runtime-error.exception';

export class PricingPlanMap {
  @Type(() => PricingPlanId)
  @Transform(({ value }) => new PricingPlanId(value))
  pricing_plan_id: string;

  @Exclude()
  mentor: MentorEntity;

  @Type(() => MentorId)
  @Transform(({ value }) => new MentorId(value))
  mentor_id: string;

  @Type(() => Amount)
  @Transform(({ value }) => new Amount(value))
  price_amount: number;

  @Type(() => Currency)
  @Transform(({ value }) => Currency.fromString(value))
  price_currency: string;

  @Type(() => PricingType)
  @Transform(({ value }) => PricingType.fromString(value))
  pricing_type: PricingTypeEnumValues;

  title: string;

  @Type(() => TrainingType)
  @Transform(({ value }) => TrainingType.fromString(value))
  training_type: TrainingTypeEnumValues;

  static toEntity(pricingPlan: PricingPlan): PricingPlanEntity {
    const pricingPlanRaw = PricingPlanMap.toRaw(pricingPlan);
    return plainToInstance(PricingPlanEntity, pricingPlanRaw);
  }

  static toDomain(pricingPlan: PricingPlanRaw): Result<PricingPlan, Error>;
  static toDomain(pricingPlan: PricingPlanEntity): Result<PricingPlan, Error>;
  static toDomain(pricingPlan: PricingPlanEntity | PricingPlanRaw): Result<PricingPlan, Error> {
    try {
      if (pricingPlan instanceof PricingPlanEntity) {
        const pricingPlanMap = plainToInstance(PricingPlanMap, pricingPlan.dataValues);
        const { pricing_plan_id, mentor_id, title, price_currency, pricing_type, price_amount, training_type } =
          <never>pricingPlanMap || {};
        const mappedPricingPlan = new PricingPlan(
          pricing_plan_id,
          mentor_id,
          new Money(price_amount, price_currency),
          training_type,
          pricing_type,
          title,
        );
        return ok(mappedPricingPlan);
      }
      if (PricingPlanMap.containsAllKeys(pricingPlan)) {
        const id = new PricingPlanId(pricingPlan.pricing_plan_id);
        const mentorId = new MentorId(pricingPlan.mentor_id);
        const rate = Money.fromStringValues(pricingPlan.price_amount, pricingPlan.price_currency);
        const trainingType = TrainingType.fromString(pricingPlan.training_type);
        const pricingType = PricingType.fromString(pricingPlan.pricing_type);
        const title = pricingPlan.title;
        const mappedPricingPlan = new PricingPlan(id, mentorId, rate, trainingType, pricingType, title);
        return ok(mappedPricingPlan);
      }
      return err(
        new RuntimeErrorException('Failed to map pricing plan', {
          method: 'PricingPlanMap.toDomain',
          input: pricingPlan,
        }),
      );
    } catch (error: any) {
      return err(
        new RuntimeErrorException('Failed to map pricing plan', {
          error,
          method: 'PricingPlanMap.toDomain',
          input: pricingPlan,
        }),
      );
    }
  }

  private static containsAllKeys(pricingPlan: any): pricingPlan is PricingPlanRaw {
    return (
      pricingPlan.hasOwnProperty('pricing_plan_id') &&
      pricingPlan.hasOwnProperty('mentor_id') &&
      pricingPlan.hasOwnProperty('title') &&
      pricingPlan.hasOwnProperty('price_currency') &&
      pricingPlan.hasOwnProperty('pricing_type') &&
      pricingPlan.hasOwnProperty('price_amount') &&
      pricingPlan.hasOwnProperty('training_type')
    );
  }

  static toJSON(pricingPlan: PricingPlan): PricingPlanRaw {
    return PricingPlanMap.toRaw(pricingPlan);
  }

  static toRaw(pricingPlan: PricingPlan): PricingPlanRaw {
    return {
      pricing_plan_id: pricingPlan.id.value,
      mentor_id: pricingPlan.mentorId.value,
      price_amount: pricingPlan.rate.amount.value,
      price_currency: pricingPlan.rate.currency.code.toString(),
      pricing_type: pricingPlan.pricingType.value,
      title: pricingPlan.title,
      training_type: pricingPlan.trainingType.value,
    };
  }
}
