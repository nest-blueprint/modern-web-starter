import { Inject, Injectable } from '@nestjs/common';
import { err, ok, Result } from 'neverthrow';
import { Sequelize } from 'sequelize-typescript';
import { SkillCollection } from '../../domain/collection/skill.collection';
import { Skill as SkillEntity } from '../sequelize/entity/skill.entity';
import { Skill } from '../../domain/skill';
import { Id as SkillId } from '../../domain/skill/id';
import { Id as MentorId } from '../../domain/mentor/id';
import { RuntimeErrorException } from '../exception/runtime-error.exception';
import { SkillMap } from '../map/skill.map';
import { SequelizeToken } from '../sequelize/token/sequelize.token';
import { MentorSkill } from '../sequelize/entity/mentor-skill.entity';
import { SkillAlreadyExistsException } from '../exception/skill-already-exists-exception';
import { Mentor as MentorEntity } from '../sequelize/entity/mentor.entity';
import { Op, Transaction } from 'sequelize';
import { storage } from '../storage/storage';
import { Skill as SkillRaw } from '../type/raw/skill.raw';
import { MentorNotFoundException } from '../exception/mentor-not-found.exception';
import { SkillNotFoundException } from '../exception/skill-not-found.excpetion';

@Injectable()
export class SkillRepository implements SkillCollection {
  private readonly skills;
  private readonly mentorSkills;

  constructor(@Inject(SequelizeToken) private sequelize: Sequelize) {
    this.skills = this.sequelize.getRepository(SkillEntity);
    this.mentorSkills = this.sequelize.getRepository(MentorSkill);
  }

  async add(skill: Skill): Promise<Result<Skill, Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const skillFromDatabaseFound = await this.skills.findOne({
        where: {
          [Op.or]: [
            {
              name: skill.name,
            },
            {
              skill_id: skill.id.value,
            },
          ],
        },
        transaction,
      });
      if (skillFromDatabaseFound) {
        return err(
          new SkillAlreadyExistsException(`Skill with name ${skill.name} or id ${skill.id.value} already exists.`),
        );
      }

      const skillFromDatabase = await this.skills.create(SkillMap.toJSON(skill), { transaction });
      const mappedSkillResult = SkillMap.toDomain(skillFromDatabase);

      if (mappedSkillResult.isErr())
        return err(new RuntimeErrorException(mappedSkillResult.error.message, mappedSkillResult.error));
      return ok(mappedSkillResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async delete(id: SkillId): Promise<Result<Skill, Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const skillFromDatabase = await this.skills.findByPk(id.value, { transaction });
      if (!skillFromDatabase)
        return err(new SkillNotFoundException(`Deletion failed.Skill with id ${id.value} not found.`));
      await this.skills.destroy({ where: { skill_id: id.value }, transaction });
      const mappedSkill = SkillMap.toDomain(skillFromDatabase);
      if (mappedSkill.isErr()) return err(new RuntimeErrorException(mappedSkill.error.message, mappedSkill.error));
      return ok(mappedSkill.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async get(id: SkillId): Promise<Result<Skill, Error>> {
    try {
      const transaction = storage.getStore() as Transaction;
      const skillFromDatabase = await this.skills.findByPk(id.value, { transaction });
      if (!skillFromDatabase) return err(new SkillNotFoundException(`Skill with id ${id.value} not found.`));
      const mappedSkill = SkillMap.toDomain(skillFromDatabase);
      if (mappedSkill.isErr()) return err(new RuntimeErrorException(mappedSkill.error.message, mappedSkill.error));
      return ok(mappedSkill.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async getSkillByName(searchedSkill: Skill): Promise<Result<Skill, Error>> {
    try {
      const transaction = storage.getStore() as Transaction;
      const skillFromDatabase = await this.skills.findOne({
        where: { name: searchedSkill.name },
        transaction,
      });
      if (!skillFromDatabase)
        return err(new SkillNotFoundException(`Skill with name ${searchedSkill.name} not found.`));
      const mappedSkill = SkillMap.toDomain(skillFromDatabase);
      if (mappedSkill.isErr()) return err(new RuntimeErrorException(mappedSkill.error.message, mappedSkill.error));
      return ok(mappedSkill.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async setMentorSkills(mentorId: MentorId, skills: Skill[]): Promise<Result<Skill[], Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const mentorFromDatabase = await MentorEntity.findByPk(mentorId.value, { transaction });
      if (!mentorFromDatabase)
        return err(
          new MentorNotFoundException(`Failed to set skills to mentor. Mentor with id ${mentorId.value} not found.`),
        );

      const skillsInDatabase = await this.skills.findAll({
        where: {
          skill_id: skills.map((skill) => skill.id.value),
          name: skills.map((skill) => skill.name),
        },
        transaction,
      });

      if (skillsInDatabase.length !== skills.length) {
        const skillsNotFound = skills.filter(
          (skill) => !skillsInDatabase.find((skillInDatabase) => skillInDatabase.skill_id === skill.id.value),
        );

        const skillsNotInDatabaseNames = skillsNotFound.map((skill) => skill.name).join(', ');
        return err(
          new SkillNotFoundException(
            `Cannot map skills to mentor ${mentorId.value}. Skills with names ${skillsNotInDatabaseNames} not found.`,
          ),
        );
      }

      await Promise.all(
        skills.map((skill) =>
          this.mentorSkills.create({ skill_id: skill.id.value, mentor_id: mentorId.value }, { transaction }),
        ),
      );

      const allMentorSkillsResult = await this.getFromMentor(mentorId);

      return allMentorSkillsResult;
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async update(skill: Skill): Promise<Result<Skill, Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const skillFromDatabase = await this.skills.findByPk(skill.id.value, { transaction });
      if (!skillFromDatabase) return err(new SkillNotFoundException(`Skill with id ${skill.id.value} not found.`));
      const skillRawObject = SkillMap.toRaw(skill);

      const updatedSkill = await skillFromDatabase.update(skillRawObject, { transaction });

      const mappedSkill = SkillMap.toDomain(updatedSkill);

      if (mappedSkill.isErr()) return err(new RuntimeErrorException(mappedSkill.error.message, mappedSkill.error));

      return ok(mappedSkill.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async getFromMentor(mentorId: MentorId): Promise<Result<Skill[], Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const mentorFromDatabase = await MentorEntity.findByPk(mentorId.value, { transaction });
      if (!mentorFromDatabase) {
        return err(
          new MentorNotFoundException(`Failed to get skills from mentor. Mentor with id ${mentorId.value} not found.`),
        );
      }
      const mentorSkillsFromDatabase = await this.mentorSkills.findAll({
        where: {
          mentor_id: mentorId.value,
        },
        transaction,
      });

      if (mentorSkillsFromDatabase.length === 0)
        return err(new SkillNotFoundException(`Skills not found for mentor with id ${mentorId.value}`));

      const skillsIds = mentorSkillsFromDatabase.map((skill) => skill.skill_id);

      const skillsObjectsFromDatabase = await this.skills.findAll({
        where: {
          skill_id: skillsIds,
        },
        transaction,
      });

      if (skillsObjectsFromDatabase.length === 0) {
        return err(
          new RuntimeErrorException(
            `Unexpected error. Global Skills not found based on mentor's skills with id ${mentorId.value}`,
          ),
        );
      }

      const mappedSkills = skillsObjectsFromDatabase.map((skill) => SkillMap.toDomain(skill));

      if (mappedSkills.some((skill) => skill.isErr()))
        return err(
          new RuntimeErrorException(
            mappedSkills.find((skill) => skill.isErr()).error.message,
            mappedSkills.find((skill) => skill.isErr()).error,
          ),
        );

      return ok(mappedSkills.map((skill) => skill.value));
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async cleanMentorSkills(mentorId: MentorId): Promise<Result<null, Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const mentorFromDatabase = await MentorEntity.findByPk(mentorId.value, { transaction });
      if (!mentorFromDatabase) {
        return err(
          new MentorNotFoundException(
            `Failed to clean skills from mentor. Mentor with id ${mentorId.value} not found.`,
          ),
        );
      }
      await this.mentorSkills.destroy({ where: { mentor_id: mentorId.value } }, { transaction });
      return ok(null);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async upsertSkill(skillsWhichHasToBeInserted: Skill[]) {
    const transaction = storage.getStore() as Transaction;
    try {
      const skillsFromDatabase: Array<SkillRaw | null> = await this.getSkillsFromDatabase(
        skillsWhichHasToBeInserted,
        transaction,
      );
      await this.addMissingSkillsGlobally(skillsFromDatabase, skillsWhichHasToBeInserted, transaction);
      const matchingSkills = await this.matchSkillsFromDatabaseUsingName(skillsWhichHasToBeInserted, transaction);

      return this.remapMatchingSkills(matchingSkills);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  private remapMatchingSkills(matchingSkills: SkillRaw[]): Result<Skill[], Error> {
    const mappedSkillsResult = matchingSkills.map((skill) => SkillMap.toDomain(skill));

    if (mappedSkillsResult.some((skill) => skill.isErr()))
      return err(new RuntimeErrorException('Cannot mapped skills from database', mappedSkillsResult));

    // At this point we are sure that all skills are mapped correctly
    const mappedSkills = mappedSkillsResult.map((skill) => skill.unwrapOr(null));

    return ok(mappedSkills);
  }

  private async matchSkillsFromDatabaseUsingName(skillsWhichHasToBeInserted: Skill[], transaction: Transaction) {
    const matchingSkills = await this.skills.findAll({
      where: {
        name: { [Op.in]: skillsWhichHasToBeInserted.map((skill) => skill.name) },
      },
      transaction,
    });
    return matchingSkills as Array<SkillRaw>;
  }

  private async addMissingSkillsGlobally(
    skillsFromDatabase: Array<SkillRaw | null>,
    skillsWhichHasToBeInserted: Skill[],
    transaction: Transaction,
  ) {
    const skillsFromDatabaseNames = skillsFromDatabase.filter((skill) => skill !== null).map((skill) => skill?.name);

    if (skillsFromDatabase.some((skill) => skill === null)) {
      const skillsToCreate = skillsWhichHasToBeInserted.filter(
        (skill) => !skillsFromDatabaseNames.includes(skill.name),
      );

      await Promise.all(
        skillsToCreate.map(async (skill) => {
          const result = await this.skills.create(SkillMap.toJSON(skill), { transaction });
          return result;
        }),
      );
    }
  }

  private async getSkillsFromDatabase(skillsWhichHasToBeInserted: Skill[], transaction: Transaction) {
    const skillsFound = await Promise.all(
      skillsWhichHasToBeInserted.map(async (skill) => {
        const result = await this.skills.findOne({ where: { name: skill.name }, raw: true, transaction });
        return result;
      }),
    );

    return skillsFound;
  }
}
