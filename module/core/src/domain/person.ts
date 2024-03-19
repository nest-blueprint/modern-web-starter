import assert from 'assert';
import { isString, length } from 'class-validator';
import { PhoneNumber } from './person/phone-number';
import { Id } from './person/id';
import { Id as UserId } from './user/id';
import { LinkedinProfileUrl } from '../infrastructure/type/linkedin-profile-url.type';

export class Person {
  static MIN_LENGTH_NAME = 3;
  static MAX_LENGTH_NAME = 30;

  constructor(
    private readonly _id: Id,
    private readonly _userId: UserId,
    private readonly _firstname?: string,
    private readonly _lastname?: string,
    private readonly _phoneNumber?: PhoneNumber,
    private readonly _nickname?: string,
    private readonly _linkedin?: LinkedinProfileUrl,
    private readonly _googlePlaceId?: string,
    private readonly _profilePhoto?: string,
  ) {
    assert(_id instanceof Id, 'Person id must be an instance of PersonId');
    assert(_userId instanceof UserId, 'Person userId must be an instance of UserId');

    if (this._nickname) {
      assert(
        isString(_nickname) && length(_nickname, Person.MIN_LENGTH_NAME, Person.MAX_LENGTH_NAME),
        'Nickname must be a string between 3 and 30 characters',
      );
    } else this._nickname = null;
    if (this._firstname) {
      assert(
        isString(_firstname) && length(_firstname, Person.MIN_LENGTH_NAME, Person.MAX_LENGTH_NAME),
        'Firstname must be a string between 3 and 30 characters',
      );
    } else this._firstname = null;
    if (this._lastname) {
      assert(
        isString(_lastname) && length(_lastname, Person.MIN_LENGTH_NAME, Person.MAX_LENGTH_NAME),
        'Lastname must be a string between 3 and 30 characters',
      );
    } else this._lastname = null;

    if (this.phoneNumber) {
      assert(this.phoneNumber instanceof PhoneNumber, 'Phone number must be an instance of PhoneNumber');
    }

    if (this._linkedin) {
      assert(this._linkedin instanceof LinkedinProfileUrl, 'Linkedin must be an instance of LinkedinProfileUrl');
    }

    if (this._googlePlaceId) {
      assert(isString(_googlePlaceId), 'Google Place Id must be a string');
    }

    if (this._profilePhoto) {
      assert(typeof this._profilePhoto === 'string', 'Profile photo must be a string');
    }
  }

  static create(userId: UserId) {
    return new Person(Id.create(), userId, null, null, null, null, null, null, null);
  }

  get id(): Id {
    return this._id;
  }

  get firstname(): string | undefined {
    return this._firstname;
  }

  get lastname(): string | undefined {
    return this._lastname;
  }

  get nickname(): string | undefined {
    return this._nickname;
  }

  get phoneNumber(): PhoneNumber | undefined {
    return this._phoneNumber;
  }

  get linkedin(): LinkedinProfileUrl | undefined {
    return this._linkedin;
  }

  get profilePhoto(): string | undefined {
    return this._profilePhoto;
  }

  get userId(): UserId {
    return this._userId;
  }

  get googlePlaceId(): string {
    return this._googlePlaceId;
  }
}
