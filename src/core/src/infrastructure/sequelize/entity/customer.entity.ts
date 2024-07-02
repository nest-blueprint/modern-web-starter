import {
  Table,
  Model,
  Column,
  BelongsToMany,
  BelongsTo,
  Unique,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { Type as CustomerType, TypeEnumValues as CustomerTypeValues } from '../../../domain/customer/type';
import { CustomerBookmarkedMentors } from './customer-bookmarked-mentors.entity';
import { Mentor } from './mentor.entity';
import { User } from './user.entity';
import { databaseSpecs } from '../specs/database.specs';

@Table({ tableName: databaseSpecs.customer.tableName, modelName: databaseSpecs.customer.modelName })
export class Customer extends Model<Customer> {
  @Column({ type: DataTypes.CHAR(36), primaryKey: true })
  customer_id!: string;

  @BelongsTo(() => User)
  user!: User;

  @Unique
  @ForeignKey(() => User)
  @Column({ type: DataTypes.CHAR(36), allowNull: false })
  user_id!: string;

  @Column({ type: DataTypes.ENUM, values: CustomerType.values(), allowNull: false })
  type!: CustomerTypeValues;

  @Column({ type: DataTypes.TEXT, allowNull: false })
  profile_description!: string;

  @BelongsToMany(() => Mentor, () => CustomerBookmarkedMentors)
  bookmarked_mentors?: Mentor[];

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  update_at: Date;
}
