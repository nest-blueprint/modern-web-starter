import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { err, ok, Result } from 'neverthrow';
import { SequelizeToken } from '../sequelize/token/sequelize.token';
import { ProfessionalExperience } from '../../domain/professional-experience';
import { Id as ExperienceId } from '../../domain/professional-experience/id';
import { Id as MentorId } from '../../domain/mentor/id';
import { RuntimeErrorException } from '../exception/runtime-error.exception';
import { ProfessionalExperienceNotFoundException } from '../exception/professional-experience-not-found.exception';
import { ProfessionalExperience as ProfessionalExperienceEntity } from '../sequelize/entity/professional-experience.entity';
import { ProfessionalExperienceMap } from '../map/professional-experience.map';
import { ProfessionalExperienceAlreadyExistsException } from '../exception/professional-experience-already-exists.exception';
import { ProfessionalExperienceCollection } from '../../domain/collection/professional-experience.collection';
import { storage } from '../storage/storage';
import { Transaction } from 'sequelize';

@Injectable()
export class ProfessionalExperienceRepository implements ProfessionalExperienceCollection {
  private readonly experiences;
  constructor(@Inject(SequelizeToken) private readonly sequelize: Sequelize) {
    this.experiences = this.sequelize.getRepository(ProfessionalExperienceEntity);
  }

  async add(experience: ProfessionalExperience): Promise<Result<ProfessionalExperience, Error>> {
    const transaction = storage.getStore();
    try {
      const experienceFromDatabase = await this.experiences.findByPk(experience.id.value, { transaction });
      if (experienceFromDatabase)
        return err(
          new ProfessionalExperienceAlreadyExistsException(
            `Addition failed. Experience with id ${experience.id.value} already exists.`,
          ),
        );
      const experienceRawObject = ProfessionalExperienceMap.toRaw(experience);

      const experienceCreatedInDatabase = await this.experiences.create(experienceRawObject, { transaction });
      const mappedExperienceResult = ProfessionalExperienceMap.toDomain(experienceCreatedInDatabase);
      if (mappedExperienceResult.isErr()) {
        return err(mappedExperienceResult.error);
      }
      return ok(mappedExperienceResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async delete(id: ExperienceId): Promise<Result<ProfessionalExperience, Error>> {
    const transaction = storage.getStore();
    try {
      const experienceFromDatabase = await this.experiences.findByPk(id.value, { transaction });
      if (!experienceFromDatabase)
        return err(
          new ProfessionalExperienceNotFoundException(
            `Deletion failed. Experience with id ${id.value} does not exist.`,
          ),
        );
      await experienceFromDatabase.destroy({ transaction });
      const mappedExperienceResult = ProfessionalExperienceMap.toDomain(experienceFromDatabase);
      if (mappedExperienceResult.isErr()) {
        return err(mappedExperienceResult.error);
      }
      return ok(mappedExperienceResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async get(id: ExperienceId): Promise<Result<ProfessionalExperience, Error>> {
    const transaction = storage.getStore();
    try {
      const experienceFromDatabase = await this.experiences.findByPk(id.value, { transaction });
      if (!experienceFromDatabase) {
        return err(
          new ProfessionalExperienceNotFoundException(`Get failed. Experience with id ${id.value} does not exist.`),
        );
      }
      const mappedExperienceResult = ProfessionalExperienceMap.toDomain(experienceFromDatabase);
      if (mappedExperienceResult.isErr()) {
        return err(mappedExperienceResult.error);
      }
      return ok(mappedExperienceResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async getFromMentor(id: MentorId): Promise<Result<ProfessionalExperience[], Error>> {
    try {
      const professionalExperiences = await this.findFromMentor(id);
      if (professionalExperiences.isErr()) {
        return err(professionalExperiences.error);
      }
      if (professionalExperiences.value.length === 0) {
        return err(
          new ProfessionalExperienceNotFoundException(
            `Get failed. No experiences found for mentor with id ${id.value}.`,
          ),
        );
      }
      return ok(professionalExperiences.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async findFromMentor(id: MentorId): Promise<Result<ProfessionalExperience[], Error>> {
    const transaction = storage.getStore();
    try {
      const experiencesFromDatabase = await this.experiences.findAll({
        where: {
          mentor_id: id.value,
        },
        transaction,
      });
      const mappedExperiencesResult = experiencesFromDatabase.map((experience) =>
        ProfessionalExperienceMap.toDomain(experience),
      );
      if (mappedExperiencesResult.some((experience) => experience.isErr())) {
        return err(mappedExperiencesResult.find((experience) => experience.isErr()).error);
      }
      const mappedExperiences = mappedExperiencesResult.map((experience) => experience.value);

      return ok(mappedExperiences);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async update(experience: ProfessionalExperience): Promise<Result<ProfessionalExperience, Error>> {
    const transaction = storage.getStore();
    try {
      const experienceFoundInDatabase = await this.experiences.findByPk(experience.id.value, { transaction });
      if (!experienceFoundInDatabase)
        return err(
          new ProfessionalExperienceNotFoundException(
            `Update failed. Experience with id ${experience.id.value} does not exist.`,
          ),
        );
      const experienceRawObject = ProfessionalExperienceMap.toRaw(experience);
      const updatedExperience = await experienceFoundInDatabase.update(experienceRawObject, { transaction });

      const mappedExperienceResult = ProfessionalExperienceMap.toDomain(updatedExperience);

      if (mappedExperienceResult.isErr()) {
        return err(mappedExperienceResult.error);
      }

      return ok(mappedExperienceResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async count(): Promise<Result<number, Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const count = await this.experiences.count({ transaction });
      return ok(count);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }
}
