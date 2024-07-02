import { BelongsTo, Column, CreatedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { Mentor } from './mentor.entity';
import { databaseSpecs } from '../specs/database.specs';

@Table({
  tableName: databaseSpecs.professionalExperience.tableName,
  modelName: databaseSpecs.professionalExperience.modelName,
})
export class ProfessionalExperience extends Model<ProfessionalExperience> {
  @Column({ type: DataTypes.CHAR(36), primaryKey: true })
  professional_experience_id!: string;

  @BelongsTo(() => Mentor)
  mentor!: Mentor;

  @ForeignKey(() => Mentor)
  @Column({ type: DataTypes.CHAR(36), allowNull: false })
  mentor_id!: string;

  @Column({ type: DataTypes.STRING(50), allowNull: false })
  job_title!: string;

  @Column({ type: DataTypes.STRING(50), allowNull: false })
  company!: string;

  @Column({ type: DataTypes.DATE, allowNull: false })
  start_date!: Date;

  @Column({ type: DataTypes.DATE, allowNull: false })
  end_date!: Date;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}
