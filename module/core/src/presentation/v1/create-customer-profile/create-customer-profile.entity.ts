import { CustomerType } from '../../../infrastructure/http/entity';

export type CreateCustomerProfileEntity = {
  type: CustomerType;
};
