import { CommandInterface } from '../interface/command.interface';
import { TypeEnum as CustomerType } from '../../domain/customer/type';
export class CreateCustomerProfileCommand implements CommandInterface {
  constructor(private readonly _user_id: string, private readonly _type: CustomerType) {
    Object.freeze(this);
  }

  get userId(): string {
    return this._user_id;
  }

  get type(): string {
    return this._type;
  }
}
