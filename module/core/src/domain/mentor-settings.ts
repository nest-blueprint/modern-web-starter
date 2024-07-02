import { Id } from './mentor/id';
import assert from 'assert';

export class MentorSettings {
  constructor(
    private readonly _mentorId: Id,
    private readonly _displayNickname: boolean,
    private readonly _displayProfilePhoto: boolean,
    private readonly _displayLocation: boolean,
    private readonly _displayEmail: boolean,
    private readonly _displayPhoneNumber: boolean,
    private readonly _displayLinkedin: boolean,
    private readonly _displayCurrentJobTitle: boolean,
  ) {
    assert(this._mentorId instanceof Id, 'mentorId must be an instance of MentorId');
    assert(typeof this._displayNickname === 'boolean', 'displayNickname must be a boolean');
    assert(typeof this._displayProfilePhoto === 'boolean', 'displayProfilePhoto must be a boolean');
    assert(typeof this._displayLocation === 'boolean', 'displayLocation must be a boolean');
    assert(typeof this._displayEmail === 'boolean', 'displayEmail must be a boolean');
    assert(typeof this._displayPhoneNumber === 'boolean', 'displayPhoneNumber must be a boolean');
    assert(typeof this._displayLinkedin === 'boolean', 'displayLinkedin must be a boolean');
    assert(typeof this._displayCurrentJobTitle === 'boolean', 'displayCurrentJobTitle must be a boolean');
    Object.freeze(this);
  }

  get mentorId(): Id {
    return this._mentorId;
  }

  get settingDisplayNickname(): boolean {
    return this._displayNickname;
  }

  get settingDisplayProfilePhoto(): boolean {
    return this._displayProfilePhoto;
  }

  get settingDisplayLocation(): boolean {
    return this._displayLocation;
  }

  get settingDisplayEmail(): boolean {
    return this._displayEmail;
  }

  get settingDisplayPhoneNumber(): boolean {
    return this._displayPhoneNumber;
  }

  get settingDisplayLinkedin(): boolean {
    return this._displayLinkedin;
  }

  get settingDisplayCurrentJobTitle(): boolean {
    return this._displayCurrentJobTitle;
  }
}
