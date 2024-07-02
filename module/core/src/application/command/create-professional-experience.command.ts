import { CommandInterface } from '../interface/command.interface';

export class CreateProfessionalExperienceCommand implements CommandInterface {
  constructor(
    private readonly _id: string,
    private readonly _company: string,
    private readonly _mentor_id: string,
    private readonly _jobTitle: string,
    private readonly _startDate: string,
    private readonly _endDate: string,
  ) {}

  get id(): string {
    return this._id;
  }

  get company(): string {
    return this._company;
  }

  get mentor_id(): string {
    return this._mentor_id;
  }

  get jobTitle(): string {
    return this._jobTitle;
  }

  get startDate(): string {
    return this._startDate;
  }

  get endDate(): string {
    return this._endDate;
  }
}
