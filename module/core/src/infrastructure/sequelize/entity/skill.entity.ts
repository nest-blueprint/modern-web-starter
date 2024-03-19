import { BelongsToMany, Column, CreatedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { Mentor } from './mentor.entity';
import { MentorSkill } from './mentor-skill.entity';
import { databaseSpecs } from '../specs/database.specs';

@Table({ tableName: databaseSpecs.skill.tableName, modelName: databaseSpecs.skill.modelName })
export class Skill extends Model<Skill> {
  @Column({ type: DataTypes.CHAR(36), primaryKey: true })
  skill_id: string;

  @Column({ type: DataTypes.STRING(50), allowNull: false, unique: true })
  name: string;

  @BelongsToMany(() => Mentor, () => MentorSkill)
  mentors?: Mentor[];

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  update_at: Date;
}
