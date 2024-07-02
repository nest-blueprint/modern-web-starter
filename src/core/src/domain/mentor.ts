import { ProfessionalExperience } from './professional-experience';
import { MentorSettings } from './mentor-settings';
import { Availability } from './mentor/availability';
import { Id } from './mentor/id';
import { Type as TrainingType } from './training/type';
import { PricingPlan } from './pricing-plan';
import { User } from './user';
import { Language } from './language';
import { Skill } from './skill';

export class Mentor {
  constructor(
    private readonly _id: Id,
    private readonly _user: User,
    private readonly _profileDescription: string,
    private readonly _availability: Availability,
    private readonly _languages: Language[],
    private readonly _trainingType: TrainingType[],
    private readonly _settings: MentorSettings,
    private readonly _skills: Skill[],
    private readonly _professionalExperiences: ProfessionalExperience[],
    private readonly _pricingPlans: PricingPlan[],
    private readonly _currentJob?: string | undefined,
    private readonly _profileTitle?: string | undefined,
  ) {
    Object.freeze(this);
  }

  static create(
    id: Id,
    user: User,
    profileDescription: string,
    availability: Availability,
    languages: Language[],
    trainingType: TrainingType[],
    skills: Skill[],
    settings: MentorSettings,
  ): Mentor {
    return new Mentor(
      id,
      user,
      profileDescription,
      availability,
      languages,
      trainingType,
      settings,
      skills,
      [],
      [],
      null,
      null,
    );
  }

  get id(): Id {
    return this._id;
  }

  get user(): User {
    return this._user;
  }

  get profileDescription(): string {
    return this._profileDescription;
  }

  get availability(): Availability {
    return this._availability;
  }

  get languages(): Language[] {
    return this._languages;
  }

  get trainingType(): TrainingType[] {
    return this._trainingType;
  }

  get professionalExperiences(): ProfessionalExperience[] {
    return this._professionalExperiences;
  }

  get pricingPlans(): PricingPlan[] {
    return this._pricingPlans;
  }

  get settings(): MentorSettings {
    return this._settings;
  }

  get skills(): Skill[] {
    return this._skills;
  }

  get currentJob(): string | undefined {
    return this._currentJob;
  }

  get profileTitle(): string | undefined {
    return this._profileTitle;
  }
}
