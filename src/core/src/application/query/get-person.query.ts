import { QueryInterface } from '../interface/query.interface';
import assert from 'assert';
import { isUUID } from 'class-validator';

export class GetPersonQuery implements QueryInterface {
  constructor(private readonly _id: string) {
    assert(isUUID(this._id, 4), 'id must be a valid UUID');
    Object.freeze(this);
  }

  get id(): string {
    return this._id;
  }
}
