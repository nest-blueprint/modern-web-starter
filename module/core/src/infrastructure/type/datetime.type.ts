import { isNotEmpty } from 'class-validator';
import assert from 'assert';
import { isValidISODateString } from 'iso-datestring-validator';
import { InvalidValueProvidedException } from '../exception/invalid-value-provided.exception';
import { PeriodUnit } from './period-unit.type';
import dayjs from 'dayjs';

export class Datetime {
  constructor(private readonly _value: string) {
    assert(
      isNotEmpty(_value),
      new InvalidValueProvidedException(
        'Invalid date format: date string should not be empty.Provided value: ' + _value,
      ),
    );
    assert(
      isValidISODateString(_value),
      new InvalidValueProvidedException(
        'Invalid date format : date string format should be ISO-8601. Provided value: ' + _value,
      ),
    );
  }

  public static fromTimestamp(timestamp: number): Datetime {
    return new Datetime(new Date(timestamp).toISOString());
  }

  public static fromDate(date: Date): Datetime {
    return new Datetime(date.toISOString());
  }

  public static fromISODateString(date: string): Datetime {
    return new Datetime(date);
  }

  public static buildDateTimeBasedOnUnit(date: string, unit: PeriodUnit): Datetime {
    assert(
      isValidISODateString(date),
      new InvalidValueProvidedException(
        'Invalid date format : date string format should be ISO-8601. Provided value: ' + date,
      ),
    );
    assert(
      Datetime.isValidPeriodUnit(unit),
      new InvalidValueProvidedException(
        `Invalid period unit: ${unit}. Allowed values: 'year','month', 'week','day','hour'`,
      ),
    );
    if (unit === 'year' || unit === 'month' || unit === 'week' || unit === 'day') {
      const dateObject = dayjs(date).hour(0).minute(0).second(0).millisecond(0);
      return Datetime.fromISODateString(date);
    }
    return Datetime.fromISODateString(date);
  }

  public static now() {
    return new Datetime(new Date(Date.now()).toISOString());
  }

  get value() {
    return this._value;
  }

  private static isValidPeriodUnit(unit: PeriodUnit): boolean {
    return unit === 'year' || unit === 'month' || unit === 'week' || unit === 'day';
  }
}
