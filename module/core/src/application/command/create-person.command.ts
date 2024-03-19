import { CommandInterface } from '../interface/command.interface';
import { isString, isUUID } from 'class-validator';
import assert from 'assert';

export class CreatePersonCommand implements CommandInterface {
  constructor(
    private readonly _persondId: string,
    private readonly _userId: string,
    private readonly _firstname?: string,
    private readonly _lastname?: string,
    private readonly _phone?: string,
    private readonly _googlePlaceId?: string,
    private readonly _nickname?: string,
    public readonly _linkedin?: string,
  ) {
    Object.freeze(this);
  }

  get persondId(): string {
    return this._persondId;
  }

  get userId(): string {
    return this._userId;
  }

  get firstname(): string {
    return this._firstname;
  }

  get lastname(): string {
    return this._lastname;
  }

  get phone(): string {
    return this._phone;
  }

  get googlePlaceId(): string {
    return this._googlePlaceId;
  }

  get nickname(): string {
    return this._nickname;
  }

  get linkedin(): string {
    return this._linkedin;
  }
}
