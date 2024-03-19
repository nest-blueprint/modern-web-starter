import { Test } from '@nestjs/testing';

import {
  MentorCollectionToken,
  PricingPlanCollectionToken,
} from '../../../../../src/infrastructure/repository/factory/token.factory';
import { InMemoryMentorRepository } from '../../../../double/repository/in-memory-mentor.repository';
import { GetPricingPlanHandler } from '../../../../../src/application/query/handler/get-pricing-plan.handler';
import { InMemoryPricingPlanRepository } from '../../../../double/repository/in-memory-pricing-plan.repository';
import { Id as MentorId } from '../../../../../src/domain/mentor/id';
import { User } from '../../../../../src/domain/user';
import { Id as UserId } from '../../../../../src/domain/user/id';
import { Id as PricingPlanId } from '../../../../../src/domain/pricing-plan/id';
import { Email } from '../../../../../src/domain/user/email';
import { Availability } from '../../../../../src/domain/mentor/availability';
import { Language } from '../../../../../src/domain/language';
import { MentorSettings } from '../../../../../src/domain/mentor-settings';
import { Mentor } from '../../../../../src/domain/mentor';
import { PricingPlan } from '../../../../../src/domain/pricing-plan';
import { Money } from '../../../../../src/domain/money';
import { Type as PricingType } from '../../../../../src/domain/pricing/type';
import { Type as TrainingType } from '../../../../../src/domain/training/type';
import { GetPricingPlanQuery } from '../../../../../src/application/query/get-pricing-plan.query';
import { PricingPlanNotFoundException } from '../../../../../src/infrastructure/exception/pricing-plan-not-found.exception';
import { Skill } from '../../../../../src/domain/skill';
import { Type } from '../../../../../src/domain/user/type';

describe('[Core/Application] GetPricingPlanHandler', () => {
  let pricingPlansRepository: InMemoryPricingPlanRepository;
  let getPricingPlanHandler: GetPricingPlanHandler;
  let mentorRepository: InMemoryMentorRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        GetPricingPlanHandler,
        { provide: PricingPlanCollectionToken, useClass: InMemoryPricingPlanRepository },
        { provide: MentorCollectionToken, useClass: InMemoryMentorRepository },
      ],
    }).compile();
    getPricingPlanHandler = module.get(GetPricingPlanHandler);
    pricingPlansRepository = module.get(PricingPlanCollectionToken);
    mentorRepository = module.get(MentorCollectionToken);
  });

  it('getPricingPlanHandler should be defined and instanced', async () => {
    expect(getPricingPlanHandler).toBeDefined();
    expect(getPricingPlanHandler).toBeInstanceOf(GetPricingPlanHandler);
  });

  it('mentorRepository should be defined and instanced', async () => {
    expect(mentorRepository).toBeDefined();
    expect(mentorRepository).toBeInstanceOf(InMemoryMentorRepository);
  });

  it('pricingPlansRepository should be defined and instanced', async () => {
    expect(pricingPlansRepository).toBeDefined();
    expect(pricingPlansRepository).toBeInstanceOf(InMemoryPricingPlanRepository);
  });

  test('Get pricing plan', async () => {
    // Mentor

    const mentorId = MentorId.create();
    const role = new Type('mentor');
    const user = User.create(UserId.create(), Email.fromString('john.doe@example.com'), role);
    const profileDescription = 'profile';
    const availability = Availability.fromString('full_time');
    const languages = [Language.fromString('en')];
    const trainingTypes = [TrainingType.fromString('remote')];
    const settings = new MentorSettings(mentorId, true, true, true, true, true, true, true);
    const mentor = Mentor.create(
      mentorId,
      user,
      profileDescription,
      availability,
      languages,
      trainingTypes,
      [Skill.create('Java')],
      settings,
    );

    // Pricing plan
    const rate = Money.fromStringValues(100, 'EUR');
    const pricingType = PricingType.fromString('hourly');
    const trainingType = TrainingType.fromString('remote');
    const pricingPlanId = PricingPlanId.create();
    const pricingPlan = new PricingPlan(pricingPlanId, mentorId, rate, trainingType, pricingType, 'Remote session');

    // Add pricing plan and mentor to the repository
    const mentorAddResult = await mentorRepository.add(mentor);
    const pricingPlanAddResult = await pricingPlansRepository.add(pricingPlan);

    expect(mentorAddResult.isOk()).toBeTruthy();
    expect(pricingPlanAddResult.isOk()).toBeTruthy();

    expect(mentorAddResult._unsafeUnwrap()).toBeInstanceOf(Mentor);
    expect(pricingPlanAddResult._unsafeUnwrap()).toBeInstanceOf(PricingPlan);

    // Get pricing plan using the query
    const getPricingPlanQuery = new GetPricingPlanQuery(mentorId.value, [pricingPlanId.value]);
    const getPricingPlanResult: PricingPlan[] = await getPricingPlanHandler.execute(getPricingPlanQuery);
    expect(getPricingPlanResult).toHaveLength(1);
    expect(getPricingPlanResult[0]).toBeInstanceOf(PricingPlan);

    // Get pricing plan using unregistered pricing plan id
    const getPricingPlanQuery2 = new GetPricingPlanQuery(mentorId.value, [PricingPlanId.create().value]);
    await expect(() => getPricingPlanHandler.execute(getPricingPlanQuery2)).rejects.toThrowError(
      PricingPlanNotFoundException,
    );
  });
});
