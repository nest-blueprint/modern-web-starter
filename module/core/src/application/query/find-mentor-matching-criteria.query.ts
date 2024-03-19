import { QueryInterface } from '../interface/query.interface';

export class FindMentorMatchingCriteriaQuery implements QueryInterface {
  constructor(
    private readonly _mentorsIds: string[],
    private readonly _priceMax?: number,
    private readonly _priceMin?: number,
    private readonly _order?: string,
    private readonly _pricingType?: string,
    private readonly _trainingType?: string[],
    private readonly _mentorAvailability?: string,
    private readonly _languages?: string[],
    private readonly _skills?: string[],
  ) {
    Object.freeze(this);
  }

  get mentorsIds(): string[] {
    return this._mentorsIds;
  }

  get priceMax(): number | undefined {
    return this._priceMax;
  }

  get priceMin(): number | undefined {
    return this._priceMin;
  }

  get order(): string | undefined {
    return this._order;
  }

  get pricingType(): string | undefined {
    return this._pricingType;
  }

  get trainingType(): string[] | undefined {
    return this._trainingType;
  }

  get mentorAvailability(): string | undefined {
    return this._mentorAvailability;
  }

  get languages(): string[] | undefined {
    return this._languages;
  }

  get skills(): string[] | undefined {
    return this._skills;
  }
}
