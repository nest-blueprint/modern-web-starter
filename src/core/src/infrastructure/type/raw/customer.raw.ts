import { TypeEnumValues as CustomerTypeValues } from '../../../domain/customer/type';
import { User as UserRaw } from './user.raw';

export type Customer = {
  customer_id: string;
  user: UserRaw;
  type: CustomerTypeValues;
  bookmarked_mentors: string[];
  profile_description: string;
};
