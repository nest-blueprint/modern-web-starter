import { Inject, Injectable } from '@nestjs/common';
import { err, ok, Result } from 'neverthrow';
import { MentorCollection } from '../../domain/collection/mentor.collection';
import { Mentor } from '../../domain/mentor';
import { Id as MentorId } from '../../domain/mentor/id';
import { Id as UserId } from '../../domain/user/id';
import { Mentor as MentorEntity } from '../sequelize/entity/mentor.entity';
import { RuntimeErrorException } from '../exception/runtime-error.exception';
import { MentorNotFoundException } from '../exception/mentor-not-found.exception';
import { MentorAlreadyExistsException } from '../exception/mentor-already-exists.exception';
import { MentorMap } from '../map/mentor.map';
import { PricingPlan } from '../sequelize/entity/pricing-plan.entity';
import { ProfessionalExperience } from '../sequelize/entity/professional-experience.entity';
import { User } from '../sequelize/entity/user.entity';
import { Person } from '../sequelize/entity/person.entity';
import { MentorFindCriteria } from '../type/mentor-find-criteria.type';
import { Skill } from '../../domain/skill';
import { Sequelize } from 'sequelize-typescript';
import { SequelizeToken } from '../sequelize/token/sequelize.token';
import { Op, Transaction } from 'sequelize';
import { OrderBy } from '../../domain/order-by';
import { MentorSettings as MentorSettingsEntity } from '../sequelize/entity/mentor-settings.entity';
import { storage } from '../storage/storage';
import { databaseSpecs } from '../sequelize/specs/database.specs';
import { MentorRepositoryInterface } from './interface/mentor-repository.interface';

@Injectable()
export class MentorRepository implements MentorCollection, MentorRepositoryInterface {
  private readonly mentors;

  constructor(@Inject(SequelizeToken) private readonly sequelize: Sequelize) {
    this.mentors = this.sequelize.getRepository(MentorEntity);
  }

  async get(id: MentorId) {
    try {
      const transaction = storage.getStore() as Transaction;
      const mentorFromDatabase = await this.mentors.findByPk(id.value, {
        include: this.getNestedEntities(),
        transaction,
      });
      if (!mentorFromDatabase) {
        return err(new MentorNotFoundException(`Get failed.Mentor with id ${id.value} not found`));
      }

      const mappedMentor = MentorMap.toDomain(mentorFromDatabase.get({ plain: true }));
      if (mappedMentor.isErr()) return err(new RuntimeErrorException(mappedMentor.error.message, mappedMentor.error));
      return ok(mappedMentor.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async add(mentor: Mentor): Promise<Result<Mentor, Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const mentorFromDatabase = await this.mentors.findByPk(mentor.id.value, { transaction });
      if (mentorFromDatabase) {
        return err(new MentorAlreadyExistsException(`Add failed.Mentor with id ${mentor.id.value} already exists`));
      }
      const mentorRawObject = { ...MentorMap.toRaw(mentor), user_id: mentor.user.id.value };

      await this.mentors.create(mentorRawObject, {
        include: [
          {
            model: MentorSettingsEntity,
          },
        ],
        transaction,
      });
      const mentorCreatedFromDatabase = await this.mentors.findByPk(mentor.id.value, {
        include: this.getNestedEntities(),
        transaction,
      });

      const mentorCreatedResult = MentorMap.toDomain(mentorCreatedFromDatabase.get({ plain: true }));

      if (mentorCreatedResult.isErr()) return err(mentorCreatedResult.error);
      const mappedMentor = mentorCreatedResult.value;
      return ok(mappedMentor);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async delete(id: MentorId): Promise<Result<Mentor, Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const mentorFromDatabase = await this.mentors.findByPk(id.value, {
        transaction,
      });
      if (!mentorFromDatabase)
        return err(new MentorNotFoundException(`Delete failed.Mentor with id ${id.value} not found`));

      await mentorFromDatabase.destroy({ transaction });

      const mentorDeleted = MentorMap.toDomain(mentorFromDatabase);

      if (mentorDeleted.isErr()) return err(mentorDeleted.error);

      return ok(mentorDeleted.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async getByIds(ids: MentorId[]) {
    const transaction = storage.getStore() as Transaction;
    if (ids.length === 0) throw new RuntimeErrorException('ids', 'ids cannot be empty');
    try {
      const mentorsFromDatabase = await this.mentors.findAll({
        where: { mentor_id: ids.map((id) => id.value) },
        include: this.getNestedEntities(),
        transaction,
      });
      if (mentorsFromDatabase.length !== ids.length) {
        return err(new MentorNotFoundException(`Get failed. Some ids provided are not matching mentors.`));
      }
      if (mentorsFromDatabase.length === 0) {
        return err(new MentorNotFoundException(`Get failed.Mentor with id ${ids.map((id) => id.value)} not found`));
      }
      const mappedMentors = mentorsFromDatabase.map((mentor) => MentorMap.toDomain(mentor.get({ plain: true })));
      if (mappedMentors.some((mentor) => mentor.isErr())) {
        return err(
          new RuntimeErrorException(
            mappedMentors.find((mentor) => mentor.isErr()).error.message,
            mappedMentors.find((mentor) => mentor.isErr()).error,
          ),
        );
      }
      return ok(mappedMentors.map((mentor) => mentor.value) as Mentor[]);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async update(mentor: Mentor): Promise<Result<Mentor, Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const mentorFromDatabase = await this.mentors.findByPk(mentor.id.value, {
        include: this.getNestedEntities(),
        transaction,
      });
      if (!mentorFromDatabase)
        return err(new MentorNotFoundException(`Update failed.Mentor with id ${mentor.id.value} not found`));
      const mentorRawObject = MentorMap.toRaw(mentor);

      const result = await mentorFromDatabase.update(mentorRawObject, {
        transaction,
        include: [
          { model: PricingPlan },
          { model: ProfessionalExperience },
          { model: Skill },
          {
            model: User,
            include: [{ model: Person }],
          },
          { model: MentorSettingsEntity },
        ],
      });

      const mappedMentor = MentorMap.toDomain(result);
      if (mappedMentor.isErr()) return err(mappedMentor.error);
      return ok(mappedMentor.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, err));
    }
  }

  async findAll(): Promise<Result<MentorId[], Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const mentorsIdsFromDatabase = await this.mentors.findAll({
        attributes: ['mentor_id'],
        transaction: transaction,
      });

      const mentorsIds = mentorsIdsFromDatabase
        .map((mentor) => mentor.get({ plain: true }).mentor_id)
        .map((id) => new MentorId(id));
      return ok(mentorsIds);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore typing error due to method overriding
  async getMentorByUserId(userId: UserId): Promise<Result<Mentor, Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const mentorFromDatabase = await this.mentors.findOne({
        where: { user_id: userId.value },
        include: this.getNestedEntities(),
        transaction,
      });

      if (!mentorFromDatabase) {
        return err(new MentorNotFoundException(`Mentor with user id ${userId.value} not found`));
      }

      const mappedMentor = MentorMap.toDomain(mentorFromDatabase.get({ plain: true }));

      if (mappedMentor.isErr()) return err(mappedMentor.error);
      return ok(mappedMentor.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async findByCriteria(criteria?: MentorFindCriteria, order?: OrderBy): Promise<Result<Mentor[], Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const queryObject = this.computeQueryObject(criteria);
      const mentorsFromDatabase = await this.mentors.findAll({ ...queryObject, transaction });

      const plainMentors = mentorsFromDatabase.map((mentor) => mentor.get({ plain: true }));

      const mappedMentorsResult = plainMentors.map((mentor) => MentorMap.toDomain(mentor));
      if (mappedMentorsResult.some((mentor) => mentor.isErr()))
        return err(
          new RuntimeErrorException(
            'Failed to map mentors while returning results',
            mappedMentorsResult.find((mentor) => mentor.isErr()).error,
          ),
        );

      const mappedMentors = mappedMentorsResult.map((mentor) => mentor.value);

      if (order) {
        if (order.value === OrderBy.Ascending) mappedMentors.sort(MentorRepository.sortMentorByPricingAscending);
        if (order.value === OrderBy.Descending) mappedMentors.sort(MentorRepository.sortMentorByPricingDescending);
      }

      //Keep only entries matching all criteria skills

      if (criteria.skills && criteria.skills.length > 0) {
        const filteredMentors = mappedMentors.filter((mentor) => {
          const mentorSkills = mentor.skills.map((skill) => skill.id.value);
          return criteria.skills.every((skill) => mentorSkills.includes(skill.id.value));
        });
        return ok(filteredMentors);
      }

      return ok(mappedMentors);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  private getNestedEntities() {
    return [
      { model: this.sequelize.model(databaseSpecs.pricingPlan.modelName) },
      { model: this.sequelize.model(databaseSpecs.professionalExperience.modelName) },
      { model: this.sequelize.model(databaseSpecs.skill.modelName) },
      {
        model: this.sequelize.model(databaseSpecs.user.modelName),
        include: [{ model: this.sequelize.model(databaseSpecs.person.modelName) }],
      },
      { model: this.sequelize.model(databaseSpecs.mentorProfileSettings.modelName) },
    ];
  }

  private computeQueryObject(criteria: MentorFindCriteria | undefined) {
    const finalObject = {
      where: {
        [Op.and]: [],
        mentor_id: criteria.ids.map((id) => id.value),
      },
      include: this.getNestedEntities(),
    };
    if (criteria.availability) {
      finalObject.where[Op.and].push({
        availability: {
          [Op.eq]: criteria.availability.value,
        },
      });
    }

    if (criteria.languages) {
      criteria.languages.forEach((language) => {
        finalObject.where[Op.and].push({
          languages: {
            [Op.like]: `%${language.value}%`,
          },
        });
      });
    }

    if (criteria.trainingType) {
      criteria.trainingType.forEach((type) => {
        finalObject.where[Op.and].push({
          training_type: {
            [Op.like]: `%${type.value}%`,
          },
        });
      });
    }

    if (criteria.pricingType) {
      if (!finalObject.include[0]['where'])
        finalObject.include[0]['where'] = {
          [Op.and]: [],
        };

      finalObject.include[0]['where'][Op.and].push({
        pricing_type: {
          [Op.eq]: criteria.pricingType.value,
        },
      });
    }

    if (criteria.priceMin) {
      if (!finalObject.include[0]['where'])
        finalObject.include[0]['where'] = {
          [Op.and]: [],
        };

      finalObject.include[0]['where'][Op.and].push({
        price_amount: {
          [Op.gte]: criteria.priceMin.amount.value,
        },
      });
    }

    if (criteria.priceMax) {
      if (!finalObject.include[0]['where'])
        finalObject.include[0]['where'] = {
          [Op.and]: [],
        };

      finalObject.include[0]['where'][Op.and].push({
        price_amount: {
          [Op.lte]: criteria.priceMax.amount.value,
        },
      });
    }

    return finalObject;
  }

  private static sortMentorByPricingAscending(a: Mentor, b: Mentor): number {
    const pricePricingPlansA = a.pricingPlans.map((pricingPlan) => pricingPlan.rate.amount.value);
    const pricePricingPlansB = b.pricingPlans.map((pricingPlan) => pricingPlan.rate.amount.value);

    const minimumPriceA = Math.min(...pricePricingPlansA);
    const minimumPriceB = Math.min(...pricePricingPlansB);

    return minimumPriceA - minimumPriceB;
  }

  private static sortMentorByPricingDescending(a: Mentor, b: Mentor): number {
    return MentorRepository.sortMentorByPricingAscending(b, a);
  }
}
