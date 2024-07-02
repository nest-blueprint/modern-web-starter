import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { DataTypes } from 'sequelize';
import { databaseSpecs } from '../specs/database.specs';

@Table({ tableName: databaseSpecs.person.tableName, modelName: databaseSpecs.person.modelName })
export class Person extends Model<Person> {
  @Column({ type: DataTypes.CHAR(36), primaryKey: true })
  person_id: string;

  @BelongsTo(() => User)
  user: User;

  @Unique
  @AllowNull(true)
  @ForeignKey(() => User)
  @Column({ type: DataTypes.CHAR(36) })
  user_id: string;

  @AllowNull(true)
  @Column
  firstname: string;

  @AllowNull(true)
  @Column
  lastname: string;

  @Unique
  @AllowNull(true)
  @Column
  phone_number: string;

  @AllowNull(true)
  @Column
  google_place_id: string;

  @AllowNull(true)
  @Column
  nickname: string;

  @AllowNull(true)
  @Column
  linkedin: string;

  @Unique
  @AllowNull(true)
  @Column
  profile_photo: string;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;
}
