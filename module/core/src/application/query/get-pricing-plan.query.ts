export class GetPricingPlanQuery {
  constructor(private readonly _mentorId: string, private readonly _pricingPlanIds: string[]) {
    Object.freeze(this);
  }

  get mentorId(): string {
    return this._mentorId;
  }

  get pricingPlansIds(): string[] {
    return this._pricingPlanIds;
  }
}
