import { QueryInterface } from '../interface/query.interface';

export class GetCustomerProfileByIdQuery implements QueryInterface {
  constructor(private readonly _customer_id: string) {
    Object.freeze(this);
  }

  get customerId(): string {
    return this._customer_id;
  }
}
