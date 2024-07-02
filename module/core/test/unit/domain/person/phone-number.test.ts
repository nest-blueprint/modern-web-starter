import { PhoneNumber } from '../../../../src/domain/person/phone-number';

describe('[Core/Domain/Person] Phone number', () => {
  test('Initialization with incorrect values', () => {
    expect(() => PhoneNumber.fromString('99999000')).toThrow();
  });

  test('Initialization with correct values', () => {
    expect(() => PhoneNumber.fromString('02 67 41 24 69')).toBeDefined();
    expect(() => PhoneNumber.fromString('04-16-23-46-35')).toBeDefined();
    expect(() => PhoneNumber.fromString('0616234635')).toBeDefined();
    expect(() => PhoneNumber.fromString('+33645512449')).toBeDefined();
  });
});
