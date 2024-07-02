export class GetProfessionalExperienceQuery {
  constructor(private readonly _mentorId: string, private readonly _experiencesIds: string[]) {}

  get mentorId(): string {
    return this._mentorId;
  }

  get experiencesIds(): string[] {
    return this._experiencesIds;
  }
}
