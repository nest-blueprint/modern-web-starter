import { UserRepository } from '../user.repository';
import { Sequelize } from 'sequelize-typescript';
import { SequelizeToken } from '../../sequelize/token/sequelize.token';
import { UserCollectionToken } from './token.factory';

export const UserRepositoryFactory = {
  provide: UserCollectionToken,
  imports: [],
  providers: [],
  inject: [SequelizeToken],
  useFactory: (sequelize: Sequelize) => {
    return new UserRepository(sequelize);
  },
};
