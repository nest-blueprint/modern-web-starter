import { Type } from './customer/type';
import { Id as CustomerId } from './customer/id';
import { Id as MentorId } from './mentor/id';
import { User } from './user';
import assert from 'assert';

export class Customer {
  static profileDescriptionMinLength = 0;
  static profileDescriptionMaxLength = 500;

  constructor(
    private readonly _customerId: CustomerId,
    private readonly _user: User,
    private readonly _customerType: Type,
    private readonly _profileDescription: string,
    private readonly _bookmarkedMentors: MentorId[],
  ) {
    assert(this._user instanceof User, 'user must be an instance of User');
    assert(this._customerId instanceof CustomerId, 'Customer id must be an instance of CustomerId');
    assert(this._customerType instanceof Type, 'Customer role must be an instance of Role');
    assert(typeof this._profileDescription === 'string', 'Customer profile description must be a string');
    assert(
      typeof this._profileDescription === 'string' &&
        this._profileDescription.length >= Customer.profileDescriptionMinLength,
      'Customer profile description must be a string with at least 0 characters',
    );
    assert(
      this._profileDescription.length < Customer.profileDescriptionMaxLength,
      `Customer profile description must not be longer than ${Customer.profileDescriptionMaxLength} characters`,
    );
    assert(Array.isArray(this._bookmarkedMentors), 'Customer bookmarked mentors must be an array');
    assert(
      this._bookmarkedMentors.find((mentorId) => !(mentorId instanceof MentorId)) === undefined,
      'Customer bookmarked mentors must be an array of MentorId',
    );
  }

  get id(): CustomerId {
    return this._customerId;
  }

  get user(): User {
    return this._user;
  }

  get customerType(): Type {
    return this._customerType;
  }

  get profileDescription(): string {
    return this._profileDescription;
  }

  get bookmarkedMentors(): MentorId[] {
    return this._bookmarkedMentors;
  }
}
