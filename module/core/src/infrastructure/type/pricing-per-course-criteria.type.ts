import { Id as MentorId } from '../../domain/mentor/id';
import { Type as TrainingType } from '../../domain/training/type';
import { Type as PricingType } from '../../domain/pricing/type';
import { Currency } from './money/currency';
import { Amount } from './money/amount';

export interface PricingPerCourseCriteria {
  mentorId?: MentorId;
  currency?: Currency;
  minAmount?: Amount;
  maxAmount?: Amount;
  trainingType?: TrainingType[];
  pricingType?: PricingType;
}
