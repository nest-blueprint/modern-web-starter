import { Mentor } from '../mentor';
import { Id } from '../mentor/id';
import { Availability } from '../mentor/availability';
import { Type as PricingType } from '../pricing/type';
import { Type as TrainingType } from '../training/type';
import { Money } from '../money';
import { Language } from '../language';
import { Skill } from '../skill';
import { OrderBy } from '../order-by';

export interface MentorCollection {
  add: (mentor: Mentor) => any;
  update: (mentor: Mentor) => any;
  delete: (id: Id) => any;
  findAll: () => any;
  findByCriteria: (
    criteria?: {
      ids?: Id[];
      availability?: Availability;
      languages?: Language[];
      trainingType?: TrainingType[];
      skills?: Skill[];
      priceMin?: Money;
      priceMax?: Money;
      pricingType?: PricingType;
    },
    order?: OrderBy,
  ) => any;
  getByIds: (ids: Id[]) => any;
  get: (id: Id) => any;
}
