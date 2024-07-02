import { Column, ForeignKey, Table, Model } from 'sequelize-typescript';

import { Customer } from './customer.entity';
import { Mentor } from './mentor.entity';
import { databaseSpecs } from '../specs/database.specs';

@Table({
  tableName: databaseSpecs.customerBookmarkedMentors.tableName,
  modelName: databaseSpecs.customerBookmarkedMentors.modelName,
})
export class CustomerBookmarkedMentors extends Model<CustomerBookmarkedMentors> {
  @ForeignKey(() => Customer)
  @Column
  customer_id!: string;

  @ForeignKey(() => Mentor)
  @Column
  mentor_id!: string;
}
