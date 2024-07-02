import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { Mentor } from './mentor.entity';
import { TrainingTypeEnumValues, Type as TrainingType } from '../../../domain/training/type';
import { Type as PricingType } from '../../../domain/pricing/type';
import { PricingTypeEnumValues } from '../../../domain/pricing/type';
import { databaseSpecs } from '../specs/database.specs';

@Table({ tableName: databaseSpecs.pricingPlan.tableName, modelName: databaseSpecs.pricingPlan.modelName })
export class PricingPlan extends Model<PricingPlan> {
  @Column({ type: DataTypes.CHAR(36), primaryKey: true })
  pricing_plan_id!: string;

  @BelongsTo(() => Mentor)
  mentor!: Mentor;

  @ForeignKey(() => Mentor)
  @Column({ type: DataTypes.CHAR(36), allowNull: false })
  mentor_id!: string;

  @Column({ type: DataTypes.INTEGER, allowNull: false })
  price_amount!: number;

  @Column({ type: DataTypes.CHAR(3), allowNull: false })
  price_currency!: string;

  @Column({ type: DataTypes.ENUM, values: TrainingType.values(), allowNull: false })
  training_type!: TrainingTypeEnumValues;

  @Column({ type: DataTypes.ENUM, values: PricingType.values(), allowNull: false })
  pricing_type!: PricingTypeEnumValues;

  @Column({ type: DataTypes.STRING(50), allowNull: false })
  title!: string;
}
