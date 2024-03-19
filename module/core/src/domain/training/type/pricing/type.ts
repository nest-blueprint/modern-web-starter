export class Type {
  public static Daily = 'daily';
  public static Hourly = 'hourly';

  constructor(private _value: string) {}

  // This is an example
  public static fromInteger(integerValue: number) {
    let mapIntegerToValue = {
      1: Type.Daily,
      2: Type.Hourly,
    };

    let value = mapIntegerToValue[integerValue];

    return new Type(value);
  }

  public value() {
    return this._value;
  }

  public equals(other: Type): boolean {
    return this._value === other.value();
  }
}
