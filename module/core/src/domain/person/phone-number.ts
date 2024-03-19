import assert from 'assert';
import phone from 'phone';
import { InvalidValueProvidedException } from '../../infrastructure/exception/invalid-value-provided.exception';

export class PhoneNumber {
  private constructor(private readonly _value: string) {
    this._value = _value;
    Object.freeze(this);
  }

  static fromString(value: string): PhoneNumber {
    const phoneObject = phone(value, { country: 'FR' });
    assert(phoneObject.isValid === true, new InvalidValueProvidedException(`Invalid phone number provided: ${value}`));
    const formattedPhoneNumber = phoneObject.phoneNumber;
    return new PhoneNumber(formattedPhoneNumber);
  }

  get value() {
    return this._value;
  }
}
