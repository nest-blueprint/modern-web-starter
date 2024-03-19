import { Language } from '../../../../src/infrastructure/type/language.type';

describe('LanguageType infrastructure object', () => {
  test('Initialization should fail with bad values', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const french = Language.fromString('french');
    }).toThrow();

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const english = Language.fromString('ENGLISH');
    }).toThrow();

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const italian = Language.fromString('ita');
    }).toThrow();

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const italian = new Language.fromString('ita1');
    }).toThrow();

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const italian = new Language.fromString('');
    }).toThrow();
  });

  test('Initialization with correct values', () => {
    expect(() => Language.fromString('fr')).toBeDefined();
    expect(() => Language.fromString('it')).toBeDefined();
    expect(() => Language.fromString('es')).toBeDefined();
    expect(() => Language.fromString('en')).toBeDefined();
  });

  test('Equals method', () => {
    const french = Language.fromString('fr');
    const french2 = Language.fromString('fr');
    const italian = Language.fromString('it');
    const german = Language.fromString('de');
    const german2 = Language.fromString('de');

    //Equality with itself
    expect(french.equals(french));

    // Equality
    expect(french.equals(italian)).toBeFalsy();
    expect(german.equals(german2)).toBeTruthy();
    // Commutativity
    expect(french.equals(french2)).toBeTruthy();
    expect(french2.equals(french)).toBeTruthy();

    // Equality with others values
    expect(french.equals('fr')).toBeFalsy();
    expect(french2.equals(null)).toBeFalsy();
    expect(italian.equals({})).toBeFalsy();
    expect(german.equals([german])).toBeFalsy();
    expect(german2.equals(123)).toBeFalsy();
  });
});
