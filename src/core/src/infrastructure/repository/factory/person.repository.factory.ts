import { PersonRepository } from '../person.repository';
import { Sequelize } from 'sequelize-typescript';
import { PersonCollectionToken } from './token.factory';
import { SequelizeToken } from '../../sequelize/token/sequelize.token';

export const PersonRepositoryFactory = {
  provide: PersonCollectionToken,
  imports: [],
  providers: [],
  inject: [SequelizeToken],
  useFactory: (sequelize: Sequelize) => {
    return new PersonRepository(sequelize);
  },
};
