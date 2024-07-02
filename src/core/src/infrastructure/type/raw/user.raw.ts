import { Person } from './person.raw';
import { TypeEnumValues } from '../../../domain/user/type';

export type User = {
  user_id: string;
  email: string;
  type: TypeEnumValues;
  person?: Person;
};
