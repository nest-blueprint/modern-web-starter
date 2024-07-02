import assert from 'assert';

export enum AllowedLanguageEnum {
  French = 'fr',
  Italian = 'it',
  Spanish = 'es',
  English = 'en',
  German = 'de',
}

const languagesEnumValues = {
  French: 'fr',
  Italian: 'it',
  Spanish: 'es',
  English: 'en',
  German: 'de',
} as const;

type Keys = keyof typeof languagesEnumValues;
export type AllowedLanguageEnumValues = typeof languagesEnumValues[Keys];

export class Language {
  public static French: AllowedLanguageEnumValues = 'fr';
  public static Italian: AllowedLanguageEnumValues = 'it';
  public static Spanish: AllowedLanguageEnumValues = 'es';
  public static English: AllowedLanguageEnumValues = 'en';
  public static German: AllowedLanguageEnumValues = 'de';

  constructor(private readonly _value: AllowedLanguageEnumValues) {
    assert(
      Object.values(languagesEnumValues).includes(_value),
      `Bad Enum<Language> initialization. Value provided : ${_value} - 
    Allowed values : ${Object.values(AllowedLanguageEnum).toString()}`,
    );
    Object.freeze(this);
  }

  get value() {
    return this._value;
  }

  equals(language: unknown): boolean {
    if (!(language instanceof Language)) return false;
    return this._value.valueOf() === language.value.valueOf();
  }

  static values() {
    return Object.values(languagesEnumValues);
  }

  static fromString(languageCode: string) {
    return new Language(languageCode as AllowedLanguageEnumValues);
  }
}
