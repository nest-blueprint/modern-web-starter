import assert from 'assert';

export enum TypeEnum {
  Individual = 'individual',
  Company = 'company',
  School = 'school',
}

const typeEnumValues = {
  Individual: 'individual',
  Company: 'company',
  School: 'school',
} as const;

type Keys = keyof typeof typeEnumValues;
export type TypeEnumValues = typeof typeEnumValues[Keys];

export class Type {
  public static Company: TypeEnumValues = 'company';
  public static Individual: TypeEnumValues = 'individual';
  public static School: TypeEnumValues = 'school';

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

  equals(role: unknown): boolean {
    if (!(role instanceof Type)) return false;
    return this._value.valueOf() === role.value.valueOf();
  }

  static values() {
    return Object.values(typeEnumValues);
  }

  static fromString(role: string) {
    return new Type(role as TypeEnumValues);
  }
}
