import { v4 as uuid } from 'uuid';
import { isUUID } from 'class-validator';
import assert from 'assert';
import { InvalidValueProvidedException } from '../exception/invalid-value-provided.exception';

export abstract class Uuid {
  protected constructor(protected readonly _value: string) {
    assert(isUUID(_value, 4), new InvalidValueProvidedException(`Invalid UUID provided : ${_value}`));
  }
  public static random(): string {
    return uuid();
  }
}
