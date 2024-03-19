import assert from 'assert';

export class Auth0UserId {
  private static readonly REGEX = /^auth0\|([0-9]+)$/;
  private readonly _value;
  constructor(value: string) {
    assert(typeof value === 'string', 'User auth0_id must be a string');
    assert(value.length > 0, 'User auth0_id must not be empty');
    assert(Auth0UserId.REGEX.test(value), 'User auth0_id must be a valid auth0 user id');
    this._value = value;
  }
  get value() {
    return this._value;
  }
}
