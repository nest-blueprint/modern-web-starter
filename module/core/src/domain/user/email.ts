import assert from 'assert';
import { isEmail } from 'class-validator';
import { InvalidValueProvidedException } from '../../infrastructure/exception/invalid-value-provided.exception';

export class Email {
  constructor(private readonly _value: string) {
    assert(isEmail(_value), new InvalidValueProvidedException(`Invalid email format : ${_value}`));
  }

  static fromString(value: string): Email {
    return new Email(value);
  }

  get value() {
    return this._value;
  }
}
