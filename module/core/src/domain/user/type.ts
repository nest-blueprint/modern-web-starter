import assert from 'assert';

export enum TypeEnum {
  Customer = 'customer',
  Mentor = 'mentor',
}

const typeEnumValues = {
  Customer: 'customer',
  Mentor: 'mentor',
} as const;

type Keys = keyof typeof typeEnumValues;
export type TypeEnumValues = typeof typeEnumValues[Keys];

export class Type {
  public static Customer: TypeEnumValues = 'customer';
  public static Mentor: TypeEnumValues = 'mentor';

  constructor(private readonly _value: TypeEnumValues) {
    assert(
      Object.values(typeEnumValues).includes(_value),
      `Bad Enum<Role> initialization. Value provided : ${_value} - 
    Allowed values : ${Object.values(TypeEnum).toString()}`,
    );
    Object.freeze(this);
  }

  get value() {
    return this._value;
  }

  equals(type: unknown): boolean {
    if (!(type instanceof Type)) return false;
    return this._value.valueOf() === type.value.valueOf();
  }

  static values() {
    return Object.values(typeEnumValues);
  }

  static fromString(type: string) {
    return new Type(type as TypeEnumValues);
  }
}
