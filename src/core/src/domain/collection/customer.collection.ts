import { Customer } from '../customer';
import { Id as CustomerId } from '../customer/id';
import { Id as UserId } from '../user/id';

export interface CustomerCollection {
  add(customer: Customer): any;
  delete(id: CustomerId): any;
  get(id: CustomerId): any;
  update(customer: Customer): any;
  getByUserId(userId: UserId): any;
}
