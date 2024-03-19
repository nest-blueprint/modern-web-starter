import { AvailabilityType, CourseRateType, CourseType } from '../../../infrastructure/http/entity';

export type GetMentorEntity = {
  /**
   * @type int
   */
  price_min?: number;

  /**
   * @type int
   */
  price_max?: number;

  pricing_type?: CourseRateType;

  /**
   * @minItems 1
   * @maxItems 30
   */
  specializations?: string[];

  /**
   * @minItems 1
   * @maxItems 2
   */
  training_type?: CourseType[];

  mentor_availability?: AvailabilityType;

  /**
   * @minItems 1
   */
  languages?: string[];

  price?: 'asc' | 'desc';

  /**
   * @format uuid
   */
  mentor_id?: string;
};
