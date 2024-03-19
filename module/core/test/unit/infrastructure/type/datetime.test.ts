import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Datetime } from '../../../../src/infrastructure/type/datetime.type';

describe('DatetimeType infrastructure object', () => {
  beforeAll(() => {
    dayjs.extend(customParseFormat);
  });
  test('Initialization with incorrect values', () => {
    expect(() => new Datetime('')).toThrow();
    expect(() => new Datetime('2022-05-12')).toThrow();
    expect(() => new Datetime('2022-05-12 14:34')).toThrow();
  });
  test('Initialization with ISO date format value', () => {
    expect(() => {
      const date = dayjs('2022-05-12', 'YYYY-MM-DD').toISOString();
      return new Datetime(date);
    }).toBeDefined();
  });
});
