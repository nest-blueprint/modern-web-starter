import { Sequelize } from 'sequelize-typescript';
import { SkillRepository } from '../skill.repository';
import { SkillCollectionToken } from './token.factory';
import { SequelizeToken } from '../../sequelize/token/sequelize.token';

export const SkillRepositoryFactory = {
  provide: SkillCollectionToken,
  imports: [],
  providers: [],
  inject: [SequelizeToken],
  useFactory: (sequelize: Sequelize) => {
    return new SkillRepository(sequelize);
  },
};
