import { MentorRepository } from '../mentor.repository';
import { Sequelize } from 'sequelize-typescript';
import { MentorCollectionToken } from './token.factory';
import { SequelizeToken } from '../../sequelize/token/sequelize.token';

export const MentorRepositoryFactory = {
  provide: MentorCollectionToken,
  imports: [],
  providers: [],
  inject: [SequelizeToken],
  useFactory: (sequelize: Sequelize) => {
    return new MentorRepository(sequelize);
  },
};
