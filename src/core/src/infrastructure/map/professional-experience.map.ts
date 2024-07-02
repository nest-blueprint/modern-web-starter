import { Exclude, plainToInstance, Transform, Type } from 'class-transformer';
import { err, ok, Result } from 'neverthrow';
import { ProfessionalExperience as ProfessionalExperienceEntity } from '../sequelize/entity/professional-experience.entity';
import { ProfessionalExperience } from '../../domain/professional-experience';
import { Period } from '../../domain/professional-experience/period';
import { Mentor } from '../sequelize/entity/mentor.entity';
import { Datetime } from '../type/datetime.type';
import { Id as ProfessionalExperienceId } from '../../domain/professional-experience/id';
import { Id as MentorId } from '../../domain/mentor/id';
import { ProfessionalExperience as ProfessionalExperienceRaw } from '../type/raw/professional-experience.raw';
import { RuntimeErrorException } from '../exception/runtime-error.exception';

export class ProfessionalExperienceMap {
  @Type(() => ProfessionalExperienceId)
  @Transform(({ value }) => new ProfessionalExperienceId(value))
  professional_experience_id: string;

  company: string;

  @Type(() => Datetime)
  @Transform(({ value }) => {
    if (typeof value === 'string') return Datetime.fromISODateString(value);
    return Datetime.fromDate(value);
  })
  end_date: Date;

  jobTitle: string;

  @Exclude()
  mentor: Mentor;

  @Type(() => MentorId)
  @Transform(({ value }) => new MentorId(value))
  mentor_id: string;

  @Type(() => Datetime)
  @Transform(({ value }) => {
    if (typeof value === 'string') return Datetime.fromISODateString(value);
    return Datetime.fromDate(value);
  })
  start_date: Date;

  static toDomain(professionalExperience: ProfessionalExperienceRaw): Result<ProfessionalExperience, Error>;
  static toDomain(professionalExperience: ProfessionalExperienceEntity): Result<ProfessionalExperience, Error>;
  static toDomain(
    professionalExperience: ProfessionalExperienceEntity | ProfessionalExperienceRaw,
  ): Result<ProfessionalExperience, Error> {
    try {
      if (professionalExperience instanceof ProfessionalExperienceEntity) {
        const mappedProfessionalExperienceData = plainToInstance(
          ProfessionalExperienceMap,
          professionalExperience.dataValues,
        );
        const { professional_experience_id, company, end_date, job_title, mentor_id, start_date } =
          <never>mappedProfessionalExperienceData || {};
        const period = Period.fromDateTimes(start_date, end_date, 'month');
        return ok(new ProfessionalExperience(professional_experience_id, job_title, company, period, mentor_id));
      }
      if (ProfessionalExperienceMap.containsAllKeys(professionalExperience)) {
        const professionalExperienceMap = plainToInstance(ProfessionalExperienceMap, professionalExperience);
        const { professional_experience_id, company, start_date, end_date, job_title, mentor_id } =
          <never>professionalExperienceMap || {};
        const period = Period.fromDateTimes(start_date, end_date, 'month');
        const mappedProfessionalExperience = new ProfessionalExperience(
          professional_experience_id,
          job_title,
          company,
          period,
          mentor_id,
        );
        return ok(mappedProfessionalExperience);
      }
      return err(
        new RuntimeErrorException('Failed to map professional professional-experience', {
          method: 'ProfessionalExperienceMap.toDomain',
          input: professionalExperience,
        }),
      );
    } catch (error: any) {
      return err(
        new RuntimeErrorException('Failed to map professional professional-experience', {
          error,
          method: 'ProfessionalExperienceMap.toDomain',
          input: professionalExperience,
        }),
      );
    }
  }

  static toEntity(professionalExperience: ProfessionalExperience): ProfessionalExperienceEntity {
    // We use toRaw() here because we need to get dates in ISO format
    return plainToInstance(ProfessionalExperienceEntity, ProfessionalExperienceMap.toRaw(professionalExperience));
  }

  static toRaw(professionalExperience: ProfessionalExperience): ProfessionalExperienceRaw {
    return {
      professional_experience_id: professionalExperience.id.value,
      company: professionalExperience.company,
      start_date: new Date(professionalExperience.period.startDate.value).toISOString(),
      end_date: new Date(professionalExperience.period.endDate.value).toISOString(),
      job_title: professionalExperience.jobTitle,
      mentor_id: professionalExperience.mentorId.value,
    };
  }

  static toJSON(professionalExperience: ProfessionalExperience) {
    return {
      professional_experience_id: professionalExperience.id.value,
      company: professionalExperience.company,
      start_date: new Date(professionalExperience.period.startDate.value),
      end_date: new Date(professionalExperience.period.endDate.value),
      job_title: professionalExperience.jobTitle,
      mentor_id: professionalExperience.mentorId.value,
    };
  }

  private static containsAllKeys(professionalExperience: any): professionalExperience is ProfessionalExperience {
    return (
      professionalExperience.hasOwnProperty('professional_experience_id') &&
      professionalExperience.hasOwnProperty('company') &&
      professionalExperience.hasOwnProperty('start_date') &&
      professionalExperience.hasOwnProperty('end_date') &&
      professionalExperience.hasOwnProperty('job_title') &&
      professionalExperience.hasOwnProperty('mentor_id')
    );
  }
}
