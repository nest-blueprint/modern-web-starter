import { Datetime } from '../../infrastructure/type/datetime.type';
import dayjs from 'dayjs';
import assert from 'assert';
import { isValidISODateString } from 'iso-datestring-validator';
import { InvalidValueProvidedException } from '../../infrastructure/exception/invalid-value-provided.exception';
import { PeriodUnit } from '../../infrastructure/type/period-unit.type';

export class Period {
  private constructor(
    private readonly _startDate: Datetime,
    private readonly _endDate: Datetime,
    private readonly _unit: PeriodUnit,
  ) {}

  static fromDateTimes(startDateTimeObject: Datetime, endDatetimeObject: Datetime, unit?: PeriodUnit) {
    let startDate;
    let endDate;
    if (!unit || unit === 'month') {
      // Avoid issues with diff method, setting the day to the last day of the month
      const dayInMonthTo = dayjs(endDatetimeObject.value).daysInMonth();
      startDate = dayjs(startDateTimeObject.value).date(1).hour(0).minute(0).second(0).millisecond(0);
      endDate = dayjs(endDatetimeObject.value).date(dayInMonthTo).hour(0).minute(0).second(0).millisecond(0);
    } else {
      startDate = dayjs(startDateTimeObject.value);
      endDate = dayjs(endDatetimeObject.value);
    }
    const diff = endDate.diff(startDate, unit);

    assert(
      diff > 0,
      `Invalid date interval : negative difference or null result between ${endDate.format(
        'YYYY-MM-DDTHH:mm:ssZ[Z]',
      )} (which is supposed to be the end date) and ${startDate.format(
        'YYYY-MM-DDTHH:mm:ssZ[Z]',
      )}, (which is supposed to be the start date) according to the provided time unit: ${unit.toString()}`,
    );

    const newStartDateTimeObject = Datetime.buildDateTimeBasedOnUnit(startDate.toISOString(), unit);
    const newEndDateTimeObject = Datetime.buildDateTimeBasedOnUnit(endDate.toISOString(), unit);

    return new Period(newStartDateTimeObject, newEndDateTimeObject, unit);
  }

  static fromString(startDate: string, endDate: string, unit: PeriodUnit): Period {
    return Period.fromDateTimes(
      Datetime.buildDateTimeBasedOnUnit(startDate, unit),
      Datetime.buildDateTimeBasedOnUnit(endDate, unit),
      unit,
    );
  }

  overlap(other: Period): boolean {
    return this.startDate.value <= other.endDate.value && this.endDate.value >= other.startDate.value;
  }

  get endDate() {
    return this._endDate;
  }

  get startDate() {
    return this._startDate;
  }

  get unit() {
    return this._unit;
  }
}
