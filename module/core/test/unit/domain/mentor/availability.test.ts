import { Availability } from '../../../../src/domain/mentor/availability';

describe('[Core/Domain/Mentor] Availability', () => {
  test('Initialization should fail with bad values', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const availability = new Availability('');
    }).toThrow();
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const availability = new Availability('ONE TIME');
    }).toThrow();
  });

  test('Initialization with correct values', () => {
    expect(new Availability(Availability.ExtraTime)).toBeDefined();
    expect(new Availability(Availability.FullTime)).toBeDefined();
    expect(new Availability(Availability.Recurring)).toBeDefined();
    expect(new Availability(Availability.OneTime)).toBeDefined();
    expect(new Availability('full_time')).toBeDefined();
    expect(new Availability('one_time')).toBeDefined();
    expect(new Availability('recurring')).toBeDefined();
    expect(new Availability('extra_time')).toBeDefined();
  });

  test('equals()', () => {
    const extraTime1 = new Availability(Availability.ExtraTime);
    const extraTime2 = new Availability(Availability.ExtraTime);
    const fullTime1 = new Availability(Availability.FullTime);
    const fullTime2 = new Availability(Availability.FullTime);
    const oneTime1 = new Availability(Availability.OneTime);
    const oneTime2 = new Availability(Availability.OneTime);
    const recurring1 = new Availability(Availability.Recurring);
    const recurring2 = new Availability(Availability.Recurring);
    // Equality with itself
    expect(extraTime1.equals(extraTime1)).toBeTruthy();

    // Commutativity
    expect(extraTime1.equals(extraTime2)).toBeTruthy();
    expect(extraTime2.equals(extraTime1)).toBeTruthy();

    // Equality
    expect(oneTime1.equals(oneTime2)).toBeTruthy();
    expect(recurring1.equals(recurring2)).toBeTruthy();
    expect(fullTime1.equals(fullTime2)).toBeTruthy();
    expect(extraTime1.equals(fullTime2)).toBeFalsy();
    expect(extraTime1.equals(fullTime2)).toBeFalsy();

    // Equality with others values
    expect(oneTime1.equals('ONE_TIME')).toBeFalsy();
    expect(oneTime1.equals(null)).toBeFalsy();
    expect(oneTime1.equals({})).toBeFalsy();
    expect(oneTime1.equals([oneTime1])).toBeFalsy();
    expect(oneTime1.equals(123)).toBeFalsy();
  });

  test('get value()', () => {
    const extraTime = new Availability(Availability.ExtraTime);
    expect(extraTime.value).toEqual(Availability.ExtraTime);
  });

  test('fromString()', () => {
    expect(Availability.fromString(Availability.ExtraTime)).toEqual(new Availability(Availability.ExtraTime));
    expect(Availability.fromString(Availability.FullTime)).toEqual(new Availability(Availability.FullTime));
    expect(Availability.fromString(Availability.OneTime)).toEqual(new Availability(Availability.OneTime));
    expect(Availability.fromString(Availability.Recurring)).toEqual(new Availability(Availability.Recurring));
  });

  test('values()', () => {
    expect(Availability.values().includes(Availability.ExtraTime)).toBe(true);
    expect(Availability.values().includes(Availability.FullTime)).toBe(true);
    expect(Availability.values().includes(Availability.OneTime)).toBe(true);
    expect(Availability.values().includes(Availability.Recurring)).toBe(true);
  });
});
