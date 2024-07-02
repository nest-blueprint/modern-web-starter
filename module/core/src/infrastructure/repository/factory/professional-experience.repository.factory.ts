import { SequelizeToken } from '../../sequelize/token/sequelize.token';
import { Sequelize } from 'sequelize-typescript';
import { ProfessionalExperienceRepository } from '../professional-experience.repository';
import { ProfessionalExperienceCollectionToken } from './token.factory';

export const ProfessionalExperienceRepositoryFactory = {
  provide: ProfessionalExperienceCollectionToken,
  imports: [],
  providers: [],
  inject: [SequelizeToken],
  useFactory: (sequelize: Sequelize) => {
    return new ProfessionalExperienceRepository(sequelize);
  },
};
