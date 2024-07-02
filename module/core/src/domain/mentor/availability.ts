import assert from 'assert';

export enum AvailabilityEnum {
  OneTime = 'one_time',
  Recurring = 'recurring',
  ExtraTime = 'extra_time',
  FullTime = 'full_time',
}

const availabilityEnumObject = {
  OneTime: 'one_time',
  Recurring: 'recurring',
  ExtraTime: 'extra_time',
  FullTime: 'full_time',
} as const;

type Keys = keyof typeof availabilityEnumObject;
export type AvailabilityEnumValues = typeof availabilityEnumObject[Keys];

export class Availability {
  public static OneTime: AvailabilityEnumValues = 'one_time';
  public static Recurring: AvailabilityEnumValues = 'recurring';
  public static ExtraTime: AvailabilityEnumValues = 'extra_time';
  public static FullTime: AvailabilityEnumValues = 'full_time';

  constructor(private readonly _value: AvailabilityEnumValues) {
    assert(
      Object.values(availabilityEnumObject).includes(_value),
      `Bad Enum<Availability> initialization. Value provided : ${_value} - 
    Allowed values : ${Object.values(AvailabilityEnum).toString()}`,
    );
    Object.freeze(this);
  }

  equals(availability: unknown): boolean {
    if (!(availability instanceof Availability)) return false;
    return this._value.valueOf() === availability.value.valueOf();
  }

  static values() {
    return Object.values(availabilityEnumObject);
  }

  static fromString(value: string): Availability {
    return new Availability(value as AvailabilityEnumValues);
  }

  get value() {
    return this._value;
  }
}
