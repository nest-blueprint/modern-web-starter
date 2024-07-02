import { QueryInterface } from '../interface/query.interface';

export class FindMentorIdsQuery implements QueryInterface {
  constructor(private readonly _ids: string[]) {
    Object.freeze(this);
  }

  get ids(): string[] {
    return this._ids;
  }
}
