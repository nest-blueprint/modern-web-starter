import { Test } from '@nestjs/testing';
import { CreatePricingPlanHandler } from '../../../../../src/application/command/handler/create-pricing-plan.handler';
import { InMemoryPricingPlanRepository } from '../../../../double/repository/in-memory-pricing-plan.repository';
import { CreatePricingPlanCommand } from '../../../../../src/application/command/create-pricing-plan.command';
import { Id as PricingPlanId } from '../../../../../src/domain/pricing-plan/id';
import { Type as TrainingType } from '../../../../../src/domain/training/type';
import { Type as PricingType } from '../../../../../src/domain/pricing/type';
import { PricingPlanCollectionToken } from '../../../../../src/infrastructure/repository/factory/token.factory';
import { Id as MentorId } from '../../../../../src/domain/mentor/id';
import { Money } from '../../../../../src/domain/money';

describe('[Core/Application] CreatePricingPlanHandler', () => {
  let createPricingPlanHandler: CreatePricingPlanHandler;
  let pricingPlanRepository: InMemoryPricingPlanRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        CreatePricingPlanHandler,
        {
          provide: PricingPlanCollectionToken,
          useClass: InMemoryPricingPlanRepository,
        },
      ],
    }).compile();

    createPricingPlanHandler = module.get(CreatePricingPlanHandler);
    pricingPlanRepository = module.get(PricingPlanCollectionToken);
  });

  beforeEach(() => {
    pricingPlanRepository.clear();
  });

  it('CreatePricingPlanHandler should be defined', () => {
    expect(createPricingPlanHandler).toBeDefined();
  });

  it('PricingPlanRepository should be defined', () => {
    expect(pricingPlanRepository).toBeDefined();
    expect(pricingPlanRepository).toBeInstanceOf(InMemoryPricingPlanRepository);
  });

  test('Create a new pricing plan', async () => {
    const mentorId = MentorId.create();

    const rate = Money.fromStringValues(100, 'EUR');
    const pricingType = PricingType.fromString('hourly');
    const trainingType = TrainingType.fromString('remote');
    const pricingPlanId = PricingPlanId.create();

    const pricingPlanCommand = new CreatePricingPlanCommand(
      pricingPlanId.value,
      mentorId.value,
      trainingType.value,
      rate.currency.code,
      rate.amount.value,
      pricingType.value,
      'Remote session',
    );

    expect(async () => {
      await createPricingPlanHandler.execute(pricingPlanCommand);
    }).not.toThrow();
  });
});
