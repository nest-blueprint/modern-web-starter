import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { err, ok, Result } from 'neverthrow';
import { PricingPlanCollection } from '../../domain/collection/pricing-plan.collection';
import { PricingPlan } from '../../domain/pricing-plan';
import { Id as PricingPlanId } from '../../domain/pricing-plan/id';
import { Id as MentorId } from '../../domain/mentor/id';
import { RuntimeErrorException } from '../exception/runtime-error.exception';
import { PricingPlanAlreadyExistException } from '../exception/pricing-plan-already-exist.exception';
import { PricingPlanNotFoundException } from '../exception/pricing-plan-not-found.exception';
import { PricingPlan as PricingPlanEntity } from '../../infrastructure/sequelize/entity/pricing-plan.entity';
import { SequelizeToken } from '../sequelize/token/sequelize.token';
import { PricingPlanMap } from '../map/pricing-plan.map';
import { storage } from '../storage/storage';

@Injectable()
export class PricingPlanRepository implements PricingPlanCollection {
  private readonly pricingPlans;
  constructor(@Inject(SequelizeToken) private sequelize: Sequelize) {
    this.pricingPlans = this.sequelize.getRepository(PricingPlanEntity);
  }

  async add(pricingPlan: PricingPlan): Promise<Result<PricingPlan, Error>> {
    const transaction = storage.getStore();
    try {
      const pricingPlanFoundFromDatabase = await this.pricingPlans.findByPk(pricingPlan.id.value, { transaction });
      if (pricingPlanFoundFromDatabase)
        return err(
          new PricingPlanAlreadyExistException(
            `Addition failed. Pricing plan with id ${pricingPlan.id.value} already exist.`,
          ),
        );
      const pricingPlanRawObject = PricingPlanMap.toRaw(pricingPlan);

      const pricingPlanFromDatabase = await this.pricingPlans.create(pricingPlanRawObject, { transaction });
      const mappedPricingPlanResult = PricingPlanMap.toDomain(pricingPlanFromDatabase);
      if (mappedPricingPlanResult.isErr())
        return err(new RuntimeErrorException(mappedPricingPlanResult.error.message, mappedPricingPlanResult.error));
      return ok(mappedPricingPlanResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async delete(pricingPlanId: PricingPlanId): Promise<Result<PricingPlan, Error>> {
    const transaction = storage.getStore();
    try {
      const pricingPlanFoundFromDatabase = await this.pricingPlans.findByPk(pricingPlanId.value, { transaction });
      if (!pricingPlanFoundFromDatabase)
        return err(
          new PricingPlanNotFoundException(`Deletion failed. Pricing plan with id ${pricingPlanId.value} not found.`),
        );
      await pricingPlanFoundFromDatabase.destroy({ transaction });
      const mappedPricingPlanResult = PricingPlanMap.toDomain(pricingPlanFoundFromDatabase);
      if (mappedPricingPlanResult.isErr()) {
        return err(new RuntimeErrorException(mappedPricingPlanResult.error.message, mappedPricingPlanResult.error));
      }
      return ok(mappedPricingPlanResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async find(id: PricingPlanId): Promise<Result<PricingPlan | null, Error>> {
    const transaction = storage.getStore();
    try {
      const pricingPlan = await this.pricingPlans.findByPk(
        id.value,

        { transaction },
      );
      if (!pricingPlan) return ok(null);

      const mappedPricingPlanResult = PricingPlanMap.toDomain(pricingPlan);
      if (mappedPricingPlanResult.isErr()) {
        return err(new RuntimeErrorException(mappedPricingPlanResult.error.message, mappedPricingPlanResult.error));
      }
      return ok(mappedPricingPlanResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async getFromMentorId(id: MentorId): Promise<Result<PricingPlan[], Error>> {
    const transaction = storage.getStore();
    try {
      const pricingPlans = await this.pricingPlans.findAll({
        where: {
          mentor_id: id.value,
        },
        transaction,
      });

      if (pricingPlans.length === 0)
        return err(new PricingPlanNotFoundException(`No pricing plan not found for mentor.`));

      const mappedPricingPlans = pricingPlans.map((pricingPlan) =>
        PricingPlanMap.toDomain(pricingPlan.get({ plain: true })),
      );
      const mappedPricingPlansResult = mappedPricingPlans.map((mappedPricingPlan) => {
        if (mappedPricingPlan.isErr()) {
          return err(new RuntimeErrorException(mappedPricingPlan.error.message, mappedPricingPlan.error));
        }
        return ok(mappedPricingPlan.value);
      });
      if (mappedPricingPlansResult.some((mappedPricingPlanResult) => mappedPricingPlanResult.isErr())) {
        return err(new RuntimeErrorException(mappedPricingPlansResult.error.message, mappedPricingPlansResult.error));
      }
      const finalResults = mappedPricingPlansResult.map((mappedPricingPlanResult) => mappedPricingPlanResult.value);
      return ok(finalResults);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async update(pricingPlan: PricingPlan): Promise<Result<PricingPlan, Error>> {
    const transaction = storage.getStore();
    try {
      const pricingPlanFoundFromDatabase = await this.pricingPlans.findByPk(pricingPlan.id.value, { transaction });

      if (!pricingPlanFoundFromDatabase)
        return err(
          new PricingPlanNotFoundException(`Update failed. Pricing plan with id ${pricingPlan.id.value} not found.`),
        );

      const pricingPlanRawObject = PricingPlanMap.toRaw(pricingPlan);
      await pricingPlanFoundFromDatabase.update(pricingPlanRawObject, { transaction });
      const mappedPricingPlan = PricingPlanMap.toDomain(pricingPlanFoundFromDatabase);
      if (mappedPricingPlan.isErr()) {
        return err(new RuntimeErrorException(mappedPricingPlan.error.message, mappedPricingPlan.error));
      }
      return ok(mappedPricingPlan.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }
}
