import { Mentor } from './mentor';
import { Id } from './professional-experience/id';
import { Id as MentorId } from './mentor/id';
import { Period } from './professional-experience/period';
import assert from 'assert';

export class ProfessionalExperience {
  static MaxJobTitleLength = 100;
  static MinJobTitleLength = 3;
  static MinCompanyLength = 2;
  static MaxCompanyLength = 50;

  constructor(
    private readonly _id: Id,
    private readonly _jobTitle: string,
    private readonly _company: string,
    private readonly _period: Period,
    private readonly _mentorId: MentorId,
  ) {
    assert(this._id instanceof Id, 'must be an instance of ProfessionalExperienceId');
    assert(typeof this._jobTitle === 'string', 'job title must be a string');
    assert(
      this._jobTitle.length <= ProfessionalExperience.MaxJobTitleLength,
      `job title must be less than ${ProfessionalExperience.MaxJobTitleLength} characters`,
    );
    assert(
      this._jobTitle.length >= ProfessionalExperience.MinJobTitleLength,
      `job title must be more than ${ProfessionalExperience.MinJobTitleLength} characters`,
    );
    assert(typeof this._company === 'string', 'company must be a string');
    assert(
      this._company.length <= ProfessionalExperience.MaxCompanyLength,
      `company must be less than ${ProfessionalExperience.MaxCompanyLength} characters`,
    );
    assert(
      this._company.length >= ProfessionalExperience.MinCompanyLength,
      `company must be more than ${ProfessionalExperience.MinCompanyLength} characters`,
    );

    assert(this._period instanceof Period, 'must be an instance of Period');
    assert(this._mentorId instanceof MentorId, 'must be an instance of MentorId');
  }

  get id(): Id {
    return this._id;
  }

  get jobTitle(): string {
    return this._jobTitle;
  }

  get company(): string {
    return this._company;
  }

  get period(): Period {
    return this._period;
  }

  get mentorId(): MentorId {
    return this._mentorId;
  }
}
