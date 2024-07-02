import { CommandInterface } from '../interface/command.interface';

export class CreatePricingPlanCommand implements CommandInterface {
  constructor(
    private readonly _id: string,
    private readonly _mentorId: string,
    private readonly _trainingType: string,
    private readonly _priceCurrency: string,
    private readonly _priceAmount: number,
    private readonly _rateType: string,
    private readonly _title: string,
  ) {
    Object.freeze(this);
  }

  get id(): string {
    return this._id;
  }

  get mentorId(): string {
    return this._mentorId;
  }

  get trainingType(): string {
    return this._trainingType;
  }

  get priceCurrency(): string {
    return this._priceCurrency;
  }

  get priceAmount(): number {
    return this._priceAmount;
  }

  get pricingType(): string {
    return this._rateType;
  }

  get title(): string {
    return this._title;
  }
}
