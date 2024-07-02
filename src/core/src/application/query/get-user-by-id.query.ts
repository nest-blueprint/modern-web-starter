import { QueryInterface } from '../interface/query.interface';
import { isUUID } from 'class-validator';
import assert from 'assert';

export class GetUserByIdQuery implements QueryInterface {
  constructor(private readonly _id: string) {
    assert(isUUID(_id, 4), 'user id must be a valid UUID');
    Object.freeze(this);
  }

  get id(): string {
    return this._id;
  }
}
