import { Email } from './user/email';
import { Id } from './user/id';
import { Person } from './person';
import assert from 'assert';
import { Type } from './user/type';
export class User {
  constructor(
    private readonly _id: Id,
    private readonly _email: Email,
    private readonly _userType: Type,
    private readonly _person?: Person,
  ) {
    assert(this._id instanceof Id, 'User id must be an instance of UserId');
    assert(this._email instanceof Email, 'User email must be an instance of Email');
    assert(this._userType instanceof Type, 'User role must be an instance of Role');
    assert(this._person instanceof Person || this._person === undefined, 'User person must be an instance of Person');
  }

  static create(id: Id, email: Email, role: Type): User {
    return new User(id, email, role);
  }

  get id(): Id {
    return this._id;
  }

  get email(): Email {
    return this._email;
  }

  get userType(): Type {
    return this._userType;
  }

  get person(): Person | undefined {
    return this._person;
  }
}
