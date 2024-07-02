import { plainToInstance, Transform, Exclude } from 'class-transformer';
import { err, ok, Result } from 'neverthrow';
import { Mentor as MentorEntity } from '../sequelize/entity/mentor.entity';
import { Availability, AvailabilityEnumValues } from '../../domain/mentor/availability';
import { MentorSettings as MentorSettingsEntity } from '../sequelize/entity/mentor-settings.entity';
import { Id as MentorId } from '../../domain/mentor/id';
import { Id as UserId } from '../../domain/user/id';
import { Id as CustomerId } from '../../domain/customer/id';
import { ProfessionalExperience as ProfessionalExperienceEntity } from '../sequelize/entity/professional-experience.entity';
import { PricingPlan as PricingPlanEntity } from '../sequelize/entity/pricing-plan.entity';
import { Skill as SkillEntity } from '../sequelize/entity/skill.entity';
import { User as UserEntity } from '../sequelize/entity/user.entity';
import { Type as TrainingType } from '../../domain/training/type';
import { Language } from '../../domain/language';
import { ProfessionalExperienceMap } from './professional-experience.map';
import { Mentor } from '../../domain/mentor';
import { SkillMap } from './skill.map';
import { UserMap } from './user.map';
import { MentorSettingsMap } from './mentor-settings.map';
import { PricingPlanMap } from './pricing-plan.map';
import { Mentor as MentorRaw } from '../../infrastructure/type/raw/mentor.raw';
import { RuntimeErrorException } from '../exception/runtime-error.exception';
import { ProfessionalExperience } from '../type/raw/professional-experience.raw';
import { Skill } from '../type/raw/skill.raw';
import { Auth0UserId } from '../resource/auth0/type/auth0-user-id';

export class MentorMap {
  @Transform(({ value }) => new MentorId(value))
  mentor_id: string;

  @Transform(({ value }) => Availability.fromString(value))
  availability: AvailabilityEnumValues;

  current_job: string | null;

  @Transform(({ value }) => value.split(',').map((lang) => new Language(lang)))
  languages: string;

  @Transform(({ value }) => value.map((exp) => ProfessionalExperienceMap.toDomain(exp)))
  professional_experiences: ProfessionalExperienceEntity[];

  @Transform(({ value }) => MentorSettingsMap.toDomain(value))
  settings: MentorSettingsEntity;

  @Transform(({ value }) => value.map((plan) => PricingPlanMap.toDomain(plan)))
  pricing_plans: PricingPlanEntity[];

  profile_description: string;

  profile_title: string | null;

  @Transform(({ value }) => value.map((skill) => SkillMap.toDomain(skill)))
  skills: SkillEntity[];

  @Transform(({ value }) => value.split(',').map((type) => new TrainingType(type)))
  training_type: string;

  @Transform(({ value }) => UserMap.toDomain(value))
  user: UserEntity;

  @Transform(({ value }) => new UserId(value))
  user_id: string;

  @Exclude()
  bookmarked_by_customers: CustomerId[];

  static toDomain(mentor: MentorRaw): Result<Mentor, Error>;
  static toDomain(mentor: MentorEntity): Result<Mentor, Error>;
  static toDomain(mentor: MentorRaw | MentorEntity): Result<Mentor, Error> {
    try {
      if (mentor instanceof MentorEntity) {
        const mappedData = plainToInstance(MentorMap, mentor.get({ plain: true }));
        const {
          profile_title,
          user,
          current_job,
          profile_description,
          mentor_id,
          availability,
          languages,
          training_type,
          professional_experiences,
          pricing_plans,
          settings,
          skills,
        } = <never>mappedData || {};
        const mappedMentor = new Mentor(
          mentor_id,
          user,
          profile_description,
          availability,
          languages,
          training_type,
          settings,
          skills,
          professional_experiences,
          pricing_plans,
          current_job,
          profile_title,
        );
        return ok(mappedMentor);
      }
      if (MentorMap.containsNeededKeys(mentor)) {
        const user = UserMap.toDomain(mentor.user);
        const skills = mentor.skills ? mentor.skills.map((skill) => SkillMap.toDomain(skill)) : [];

        const trainingType = mentor.training_type.split(',').map((type) => TrainingType.fromString(type));

        const professionalExperiences = mentor.professional_experiences
          ? mentor.professional_experiences.map((exp) => ProfessionalExperienceMap.toDomain(exp))
          : [];

        const pricingPlans = mentor.pricing_plans
          ? mentor.pricing_plans.map((plan) => PricingPlanMap.toDomain(plan))
          : [];

        const mentorSettings = MentorSettingsMap.toDomain(mentor.settings);

        const results = [user, skills, professionalExperiences, pricingPlans, mentorSettings].flat();

        if (results.some((x) => x?.isErr())) {
          const errors = results.filter((x) => x?.isErr()).map((x) => x.mapErr((e) => e));
          return err(
            new RuntimeErrorException('Failed to map mentor', { method: 'MentorMap.toDomain', input: mentor, errors }),
          );
        }
        const mentorId = new MentorId(mentor.mentor_id);

        const languages = mentor.languages.split(',').map((lang) => Language.fromString(lang));

        const mappedMentor = new Mentor(
          mentorId,
          user.unwrapOr(null),
          mentor.profile_description,
          Availability.fromString(mentor.availability),
          languages,
          trainingType,
          mentorSettings.unwrapOr(null),
          skills.map((skill) => skill.unwrapOr(null)),
          professionalExperiences.map((exp) => exp.unwrapOr(null)),
          pricingPlans.map((plan) => plan.unwrapOr(null)),
          mentor.current_job,
          mentor.profile_title,
        );
        return ok(mappedMentor);
      }

      return err(new RuntimeErrorException('Failed to map mentor', { method: 'MentorMap.toDomain', input: mentor }));
    } catch (error: any) {
      return err(
        new RuntimeErrorException('Failed to map mentor', { error, method: 'MentorMap.toDomain', input: mentor }),
      );
    }
  }

  static toEntity(mentor: Mentor, auth0UserId: Auth0UserId): MentorEntity {
    const mappedMentor = new MentorEntity();
    mappedMentor.mentor_id = mentor.id.value;
    mappedMentor.user = UserMap.toEntity(mentor.user, auth0UserId);
    mappedMentor.user_id = mentor.user.id.value;
    mappedMentor.profile_description = mentor.profileDescription;
    mappedMentor.availability = mentor.availability.value;
    mappedMentor.languages = mentor.languages.map((lang) => lang.value).join(',');
    mappedMentor.training_type = mentor.trainingType.map((type) => type.value).join(',');
    mappedMentor.settings = MentorSettingsMap.toEntity(mentor.settings);
    mappedMentor.skills = mentor.skills.map((skill) => SkillMap.toEntity(skill));
    mappedMentor.professional_experiences = mentor.professionalExperiences.map((experience) =>
      ProfessionalExperienceMap.toEntity(experience),
    );
    mappedMentor.pricing_plans = mentor.pricingPlans.map((plan) => PricingPlanMap.toEntity(plan));
    mappedMentor.current_job = mentor.currentJob;
    mappedMentor.profile_title = mentor.profileTitle;
    return mappedMentor;
  }

  static toRaw(mentor: Mentor): MentorRaw {
    const user = UserMap.toRaw(mentor.user);
    const skills: Skill[] = mentor.skills.map((skill) => ({ name: skill.name, skill_id: skill.id.value }));
    const training_type = mentor.trainingType.map((type) => type.value).join(',');
    const professional_experiences: ProfessionalExperience[] = mentor.professionalExperiences.map((exp) =>
      ProfessionalExperienceMap.toRaw(exp),
    );
    const pricing_plans = mentor.pricingPlans.map((plan) => PricingPlanMap.toRaw(plan));
    const settings = MentorSettingsMap.toRaw(mentor.settings);
    return {
      mentor_id: mentor.id.value,
      profile_description: mentor.profileDescription,
      profile_title: mentor.profileTitle,
      availability: mentor.availability.value,
      current_job: mentor.currentJob,
      languages: mentor.languages.map((lang) => lang.value).join(','),
      professional_experiences,
      user,
      training_type,
      skills,
      pricing_plans,
      settings,
    };
  }

  static toJSON(mentor: Mentor) {
    return {
      mentor_id: mentor.id.value,
      user: UserMap.toJSON(mentor.user),
      profile_description: mentor.profileDescription,
      availability: mentor.availability.value,
      trainingType: mentor.trainingType.map((type) => type.value),
      languages: mentor.languages.map((lang) => lang.value),
      current_job: mentor.currentJob,
      profile_title: mentor.profileTitle,
      professional_experiences: mentor.professionalExperiences.map((exp) => ProfessionalExperienceMap.toJSON(exp)),
      pricing_plans: mentor.pricingPlans.map((plan) => PricingPlanMap.toJSON(plan)),
      skills: mentor.skills.map((skill) => SkillMap.toJSON(skill)),
      mentor_settings: MentorSettingsMap.toJSON(mentor.settings),
    };
  }

  private static containsNeededKeys(mentor: any): mentor is MentorRaw {
    return ['mentor_id', 'user', 'profile_description', 'availability', 'languages', 'training_type'].every((key) =>
      Object.keys(mentor).includes(key),
    );
  }
}
