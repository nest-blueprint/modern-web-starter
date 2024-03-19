import { Sequelize } from 'sequelize-typescript';
import { SequelizeToken } from '../../sequelize/token/sequelize.token';
import { PricingPlanCollectionToken } from './token.factory';
import { PricingPlanRepository } from '../pricing-plan.repository';

export const PricingPlanRepositoryFactory = {
  provide: PricingPlanCollectionToken,
  imports: [],
  providers: [],
  inject: [SequelizeToken],
  useFactory: (sequelize: Sequelize) => {
    return new PricingPlanRepository(sequelize);
  },
};
