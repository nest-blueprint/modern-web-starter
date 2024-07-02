import { Column, CreatedAt, HasOne, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { Person } from './person.entity';
import { Type, TypeEnumValues } from '../../../domain/user/type';
import { databaseSpecs } from '../specs/database.specs';

@Table({ tableName: databaseSpecs.user.tableName, modelName: databaseSpecs.user.modelName })
export class User extends Model<User> {
  @Column({ type: DataTypes.CHAR(36), primaryKey: true })
  user_id!: string;

  @HasOne(() => Person)
  person?: Person;

  @Column({ type: DataTypes.STRING, unique: true, allowNull: false })
  email!: string;

  @Column({ type: DataTypes.ENUM, values: Type.values(), allowNull: false })
  type!: TypeEnumValues;

  @Column({ type: DataTypes.STRING, allowNull: false, unique: true })
  auth0_id!: string;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;
}
