import { CommandInterface } from '../interface/command.interface';

export class CreateMentorProfileCommand implements CommandInterface {
  constructor(
    private readonly _mentorId: string,
    private readonly _userId: string,
    private readonly _profileDescription: string,
    private readonly _availability: string,
    private readonly _languages: string[],
    private readonly _trainingType: string[],
    private readonly _profileTitle: string | undefined,
    private readonly _currentJobTitle: string | undefined,
    private readonly _skills: string[],
    private readonly _settingDisplayNickname: boolean,
    private readonly _settingDisplayProfilePhoto: boolean,
    private readonly _settingDisplayLocation: boolean,
    private readonly _settingDisplayEmail: boolean,
    private readonly _settingDisplayPhone: boolean,
    private readonly _settingDisplayLinkedin: boolean,
    private readonly _settingDisplayCurrentJobTitle: boolean,
  ) {
    Object.freeze(this);
  }

  get mentorId(): string {
    return this._mentorId;
  }

  get userId(): string {
    return this._userId;
  }

  get profileDescription(): string {
    return this._profileDescription;
  }

  get profileTitle(): string | undefined {
    return this._profileTitle;
  }

  get currentJobTitle(): string | undefined {
    return this._currentJobTitle;
  }

  get availability(): string {
    return this._availability;
  }

  get languages(): string[] {
    return this._languages;
  }

  get trainingType(): string[] {
    return this._trainingType;
  }

  get skills(): string[] {
    return this._skills;
  }

  get settingDisplayName(): boolean {
    return this._settingDisplayNickname;
  }

  get settingDisplayProfilePhoto(): boolean {
    return this._settingDisplayProfilePhoto;
  }

  get settingDisplayLocation(): boolean {
    return this._settingDisplayLocation;
  }

  get settingDisplayEmail(): boolean {
    return this._settingDisplayEmail;
  }

  get settingDisplayPhone(): boolean {
    return this._settingDisplayPhone;
  }

  get settingDisplayLinkedin(): boolean {
    return this._settingDisplayLinkedin;
  }

  get settingDisplayCurrentJobTitle(): boolean {
    return this._settingDisplayCurrentJobTitle;
  }
}
