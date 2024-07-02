import assert from 'assert';

export enum OrderByEnum {
  Ascending = 'asc',
  Descending = 'desc',
}

const orderByEnumObject = {
  asc: 'asc',
  desc: 'desc',
} as const;

type Keys = keyof typeof orderByEnumObject;
export type OrderByEnumValues = typeof orderByEnumObject[Keys];

export class OrderBy {
  public static Ascending: OrderByEnumValues = 'asc';
  public static Descending: OrderByEnumValues = 'desc';

  constructor(private readonly _value: OrderByEnumValues) {
    assert(
      Object.values(orderByEnumObject).includes(_value),
      `Bad Enum<OrderBy> initialization. Value provided : ${_value} - 
    Allowed values : ${Object.values(orderByEnumObject).toString()}`,
    );
    Object.freeze(this);
  }

  get value() {
    return this._value;
  }

  equals(orderBy: unknown): boolean {
    if (!(orderBy instanceof OrderBy)) return false;
    return this.value.valueOf() === orderBy.value.valueOf();
  }

  static fromString(value: string): OrderBy {
    return new OrderBy(orderByEnumObject[value]);
  }

  static values() {
    return Object.values(OrderByEnum);
  }
}
