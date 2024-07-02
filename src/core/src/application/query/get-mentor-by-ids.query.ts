import { QueryInterface } from '../interface/query.interface';

export class GetMentorByIdsQuery implements QueryInterface {
  constructor(private readonly _ids: string[]) {
    Object.freeze(this);
  }

  get ids() {
    return this._ids;
  }
}
