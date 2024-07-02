import { Id as MentorId } from '../../domain/mentor/id';
import { Availability } from '../../domain/mentor/availability';
import { Language } from '../../domain/language';
import { Type as TrainingType } from '../../domain/training/type';
import { Money } from '../../domain/money';
import { Type as PricingType } from '../../domain/pricing/type';

import { Skill } from '../../domain/skill';

export type MentorFindCriteria = {
  ids?: MentorId[];
  availability?: Availability;
  languages?: Language[];
  trainingType?: TrainingType[];
  skills?: Skill[];
  priceMin?: Money;
  priceMax?: Money;
  pricingType?: PricingType;
};
