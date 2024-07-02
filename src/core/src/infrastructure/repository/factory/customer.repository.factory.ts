import { Sequelize } from 'sequelize-typescript';
import { CustomerCollectionToken } from './token.factory';
import { SequelizeToken } from '../../sequelize/token/sequelize.token';
import { CustomerRepository } from '../customer.repository';

export const CustomerRepositoryFactory = {
  provide: CustomerCollectionToken,
  imports: [],
  providers: [],
  inject: [SequelizeToken],
  useFactory: (sequelize: Sequelize) => {
    return new CustomerRepository(sequelize);
  },
};
