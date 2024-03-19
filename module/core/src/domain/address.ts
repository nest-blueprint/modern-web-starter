import { Id } from './address/id';

export class Address {
  constructor(private readonly _id: Id, private readonly _googlePlaceId: string) {}

  get id(): Id {
    return this._id;
  }

  get googlePlaceId(): string {
    return this._googlePlaceId;
  }
}
