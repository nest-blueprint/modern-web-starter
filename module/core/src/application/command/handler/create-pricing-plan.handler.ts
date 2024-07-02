import { Inject } from '@nestjs/common';
import { CommandHandlerInterface } from '../../interface/command-handler.interface';
import { CreatePricingPlanCommand } from '../create-pricing-plan.command';
import { PricingPlanCollection } from '../../../domain/collection/pricing-plan.collection';
import { Id as MentorId } from '../../../domain/mentor/id';
import { PricingPlan } from '../../../domain/pricing-plan';
import { Id as PricingPlanId } from '../../../domain/pricing-plan/id';
import { Money } from '../../../domain/money';
import { Type as TrainingType } from '../../../domain/training/type';
import { Type as PricingType } from '../../../domain/pricing/type';
import { PricingPlanCollectionToken } from '../../../infrastructure/repository/factory/token.factory';
import { CommandHandler } from '@nestjs/cqrs';
import { PricingPlanCreationFailedException } from '../../../infrastructure/exception/pricing-plan-creation-failed.exception';
import { InvalidArgumentCommandException } from '../../exception/command/invalid-argument-command.exception';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@CommandHandler(CreatePricingPlanCommand)
export class CreatePricingPlanHandler implements CommandHandlerInterface {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(PricingPlanCollectionToken) private readonly pricingPlanRepository: PricingPlanCollection,
  ) {}

  async execute(createPricingPlanCommand: CreatePricingPlanCommand) {
    this.logger.debug('CreatePricingPlanHandler.execute', { createPricingPlanCommand });
    const pricingPlan = this.createPricingPlanObject(createPricingPlanCommand);

    await this.addPricingPlanToRepository(pricingPlan);

    this.logger.debug('CreatePricingPlanHandler.execute : success');
  }

  private getValueObjectFromCommand(createPricingPlanCommand: CreatePricingPlanCommand) {
    const mentorId = new MentorId(createPricingPlanCommand.mentorId);
    const pricingPlanId = new PricingPlanId(createPricingPlanCommand.id);
    const rate = Money.fromStringValues(createPricingPlanCommand.priceAmount, createPricingPlanCommand.priceCurrency);
    const trainingType = TrainingType.fromString(createPricingPlanCommand.trainingType);
    const pricingType = PricingType.fromString(createPricingPlanCommand.pricingType);
    return { mentorId, pricingPlanId, rate, trainingType, pricingType };
  }

  private createPricingPlanObject(createPricingPlanCommand: CreatePricingPlanCommand) {
    this.logger.debug('CreatePricingPlanHandler.execute : create pricing plan');
    try {
      const { mentorId, pricingPlanId, rate, trainingType, pricingType } =
        this.getValueObjectFromCommand(createPricingPlanCommand);
      return new PricingPlan(pricingPlanId, mentorId, rate, trainingType, pricingType, createPricingPlanCommand.title);
    } catch (error: any) {
      throw new InvalidArgumentCommandException(error.message, error);
    }
  }

  private async addPricingPlanToRepository(pricingPlan: PricingPlan) {
    this.logger.debug('CreatePricingPlanHandler.execute : add pricing plan to the repository');
    const pricingPlanAddedResult = await this.pricingPlanRepository.add(pricingPlan);
    if (pricingPlanAddedResult.isErr()) {
      throw new PricingPlanCreationFailedException(
        'Cannot create pricing plan for the mentor ' + pricingPlan.mentorId.value,
        pricingPlanAddedResult.error,
      );
    }
  }
}
