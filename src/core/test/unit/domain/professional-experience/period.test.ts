import dayjs from 'dayjs';
import { Period } from '../../../../src/domain/professional-experience/period';
import { Datetime } from '../../../../src/infrastructure/type/datetime.type';

describe('Period domain object', () => {
  test('Initialization with incorrect values for month interval', () => {
    expect(() => {
      const from = dayjs('2022-05-22', 'YYYY-MM-DD').toISOString();
      const to = dayjs('2022-05-22', 'YYYY-MM-DD').toISOString();
      return Period.fromDateTimes(Datetime.fromISODateString(from), Datetime.fromISODateString(to), 'month');
    }).toThrow();
  });

  test('Initialization with incorrect values for day interval', () => {
    expect(() => {
      const from = dayjs('2021-05-22', 'YYYY-MM-DD').toISOString();
      const to = dayjs('2021-05-22', 'YYYY-MM-DD').toISOString();
      return Period.fromDateTimes(Datetime.fromISODateString(from), Datetime.fromISODateString(to), 'day');
    }).toThrow();
  });

  test('Initialization with incorrect values for week interval', () => {
    expect(() => {
      const from = dayjs('2021-05-22', 'YYYY-MM-DD').toISOString();
      const to = dayjs('2021-05-22', 'YYYY-MM-DD').toISOString();
      return Period.fromDateTimes(Datetime.fromISODateString(from), Datetime.fromISODateString(to), 'week');
    }).toThrow();
  });

  test('Initialization with incorrect values for year interval', () => {
    expect(() => {
      const from = dayjs('2021-05-22', 'YYYY-MM-DD').toISOString();
      const to = dayjs('2021-05-22', 'YYYY-MM-DD').toISOString();
      return Period.fromDateTimes(Datetime.fromISODateString(from), Datetime.fromISODateString(to), 'year');
    }).toThrow();
  });
});
