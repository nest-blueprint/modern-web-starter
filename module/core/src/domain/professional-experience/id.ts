import { Uuid } from '../../infrastructure/type/uuid.type';

export class Id extends Uuid {
  constructor(protected readonly _value: string) {
    super(_value);
  }
  get value() {
    return this._value;
  }

  static create() {
    return new Id(super.random());
  }
}
