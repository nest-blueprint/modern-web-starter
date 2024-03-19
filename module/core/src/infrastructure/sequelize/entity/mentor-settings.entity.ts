import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { Mentor } from './mentor.entity';
import { databaseSpecs } from '../specs/database.specs';

@Table({
  tableName: databaseSpecs.mentorProfileSettings.tableName,
  modelName: databaseSpecs.mentorProfileSettings.modelName,
})
export class MentorSettings extends Model<MentorSettings> {
  @PrimaryKey
  @ForeignKey(() => Mentor)
  @Column({ type: DataTypes.CHAR(36), allowNull: false, unique: true })
  mentor_id!: string;

  @BelongsTo(() => Mentor)
  mentor!: Mentor;

  @Column({ type: DataTypes.TINYINT, allowNull: false })
  display_nickname!: number;

  @Column({ type: DataTypes.TINYINT, allowNull: false })
  display_phone_number!: number;

  @Column({ type: DataTypes.TINYINT, allowNull: false })
  display_location!: number;

  @Column({ type: DataTypes.TINYINT, allowNull: false })
  display_linkedin!: number;

  @Column({ type: DataTypes.TINYINT, allowNull: false })
  display_profile_photo!: number;

  @Column({ type: DataTypes.TINYINT, allowNull: false })
  display_current_job_title!: number;

  @Column({ type: DataTypes.TINYINT, allowNull: false })
  display_email!: number;
}
