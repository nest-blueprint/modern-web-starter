import { Column, CreatedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';

import { Skill } from './skill.entity';
import { Mentor } from './mentor.entity';
import { databaseSpecs } from '../specs/database.specs';

@Table({ tableName: databaseSpecs.mentorSkill.tableName, modelName: databaseSpecs.mentorSkill.modelName })
export class MentorSkill extends Model<MentorSkill> {
  @ForeignKey(() => Skill)
  @Column
  skill_id!: string;

  @ForeignKey(() => Mentor)
  @Column
  mentor_id!: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}
