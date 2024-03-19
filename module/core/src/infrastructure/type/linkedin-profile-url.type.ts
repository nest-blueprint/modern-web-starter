import assert from 'assert';

export class LinkedinProfileUrl {
  private static LINKEDIN_REGEX = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)\/?$/;

  constructor(private readonly _value: string) {
    assert(
      typeof this._value === 'string' && LinkedinProfileUrl.LINKEDIN_REGEX.test(_value),
      'Linkedin must be a string and match the pattern https://www.linkedin.com/in/username/',
    );
  }

  static fromString(value: string): LinkedinProfileUrl {
    return new LinkedinProfileUrl(value);
  }

  get value(): string {
    return this._value;
  }
}
