import assert from 'assert';
import ISO6391, { LanguageCode } from 'iso-639-1';
import { isEmpty } from 'class-validator';
import { InvalidValueProvidedException } from '../exception/invalid-value-provided.exception';

export class Language {
  protected constructor(protected readonly _value: LanguageCode) {
    assert(!isEmpty(this._value), new InvalidValueProvidedException('Language code must be provided'));
    Object.freeze(this);
  }

  static fromString(languageCode: LanguageCode): Language {
    const languageName = ISO6391.getName(languageCode);
    assert(
      languageName !== '',
      new InvalidValueProvidedException(
        `Language code must be one of the allowed languages : ${Language.values().toString()}`,
      ),
    );
    if (languageName) return new Language(languageCode);
  }

  get value() {
    return this._value;
  }

  equals(language: unknown): boolean {
    if (!(language instanceof Language)) return false;
    return this._value.valueOf() === language.value.valueOf();
  }

  static values() {
    return ISO6391.getAllCodes();
  }
}
