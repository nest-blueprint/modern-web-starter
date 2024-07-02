import {
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { Availability, AvailabilityEnumValues } from '../../../domain/mentor/availability';
import { DataTypes } from 'sequelize';
import { ProfessionalExperience } from './professional-experience.entity';
import { PricingPlan } from './pricing-plan.entity';
import { Skill } from './skill.entity';
import { MentorSkill } from './mentor-skill.entity';
import { MentorSettings } from './mentor-settings.entity';
import { CustomerBookmarkedMentors } from './customer-bookmarked-mentors.entity';
import { Customer } from './customer.entity';
import { databaseSpecs } from '../specs/database.specs';

@Table({ tableName: databaseSpecs.mentor.tableName, modelName: databaseSpecs.mentor.modelName })
export class Mentor extends Model<Mentor> {
  @Column({ type: DataTypes.CHAR(36), primaryKey: true })
  mentor_id!: string;

  @BelongsTo(() => User)
  user!: User;

  @Unique
  @ForeignKey(() => User)
  @Column({ type: DataTypes.CHAR(36), allowNull: false })
  user_id!: string;

  @Column({ type: DataTypes.ENUM, values: Availability.values(), allowNull: false })
  availability!: AvailabilityEnumValues;

  @Column({ type: DataTypes.CHAR(30), allowNull: false })
  languages!: string;

  @Column({
    type: DataTypes.CHAR(50),
    allowNull: false,
  })
  training_type!: string;

  @Column({ type: DataTypes.TEXT, allowNull: false })
  profile_description!: string;

  @Column({ type: DataTypes.STRING(50) })
  profile_title?: string;

  @Column({ type: DataTypes.STRING(100) })
  current_job?: string;

  @HasMany(() => ProfessionalExperience)
  professional_experiences?: ProfessionalExperience[];

  @HasMany(() => PricingPlan)
  pricing_plans?: PricingPlan[];

  @BelongsToMany(() => Skill, () => MentorSkill)
  skills?: Skill[];

  @BelongsToMany(() => Customer, () => CustomerBookmarkedMentors)
  bookmarked_by_customers?: Customer[];

  @HasOne(() => MentorSettings)
  settings: MentorSettings;

  @CreatedAt
  create_at!: Date;

  @UpdatedAt
  updated_at!: Date;
}
