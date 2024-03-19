import { CommandInterface } from '../interface/command.interface';
import { TypeEnumValues as CustomerType } from '../../domain/customer/type';

export class CreateCustomerProfileCommand implements CommandInterface {
  constructor(
    private readonly _user_id: string,
    private readonly _customer_id: string,
    private readonly _type: CustomerType,
  ) {
    Object.freeze(this);
  }

  get userId(): string {
    return this._user_id;
  }

  get customerId(): string {
    return this._customer_id;
  }

  get type(): CustomerType {
    return this._type;
  }
}
