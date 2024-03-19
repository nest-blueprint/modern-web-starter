import assert from 'assert';

enum PricingEnumType {
  Daily = 'daily',
  Hourly = 'hourly',
}

const pricingTypeEnumObject = {
  Daily: 'daily',
  Hourly: 'hourly',
} as const;

type Keys = keyof typeof pricingTypeEnumObject;
export type PricingTypeEnumValues = typeof pricingTypeEnumObject[Keys];

export class Type {
  public static Daily: PricingTypeEnumValues = 'daily';
  public static Hourly: PricingTypeEnumValues = 'hourly';

  constructor(private readonly _value: PricingTypeEnumValues) {
    assert(
      Object.values(pricingTypeEnumObject).includes(_value),
      `Bad Enum<PricingType> initialization. Value provided : ${_value} - 
    Allowed values : ${Object.values(PricingEnumType).toString()}`,
    );
    Object.freeze(this);
  }

  get value() {
    return this._value;
  }

  equals(pricing: unknown): boolean {
    if (!(pricing instanceof Type)) return false;
    return this.value.valueOf() === pricing.value.valueOf();
  }

  static fromString(value: string): Type {
    return new Type(value as PricingTypeEnumValues);
  }

  static values() {
    return Object.values(pricingTypeEnumObject);
  }
}
