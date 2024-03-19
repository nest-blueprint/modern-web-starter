import assert from 'assert';
import { isInt, isPositive } from 'class-validator';
import { InvalidValueProvidedException } from '../../exception/invalid-value-provided.exception';

export class Amount {
  constructor(private readonly _value: number) {
    assert(
      isPositive(_value) && isInt(_value),
      new InvalidValueProvidedException(`Wrong value for amount : ${_value}. Please provide a positive integer.`),
    );
    Object.freeze(this);
  }

  get value(): number {
    return this._value;
  }
}
