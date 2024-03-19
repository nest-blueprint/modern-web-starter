import { MentorCollection } from '../../../src/domain/collection/mentor.collection';
import { Mentor } from '../../../src/domain/mentor';
import { Id as MentorId } from '../../../src/domain/mentor/id';
import { err, ok, Result } from 'neverthrow';
import { MentorNotFoundException } from '../../../src/infrastructure/exception/mentor-not-found.exception';
import { MentorAlreadyExistsException } from '../../../src/infrastructure/exception/mentor-already-exists.exception';
import { Inject, Injectable } from '@nestjs/common';
import { MentorFindCriteria } from '../../../src/infrastructure/type/mentor-find-criteria.type';
import { OrderBy } from '../../../src/domain/order-by';
import { Money } from '../../../src/domain/money';
import { Type as PricingType } from '../../../src/domain/pricing/type';
import { Id as UserId } from '../../../src/domain/user/id';
import { MentorRepositoryInterface } from '../../../src/infrastructure/repository/interface/mentor-repository.interface';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class InMemoryMentorRepository implements MentorCollection, MentorRepositoryInterface {
  private readonly mentors: Map<string, Mentor> = new Map();

  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  add(mentor: Mentor): Result<Mentor, Error> {
    this.logger.debug(`InMemoryMentorRepository.add : execute - ${mentor.id.value}`, { mentor });
    this.logger.debug(`InMemoryMentorRepository : contains ${this.mentors.size}`, { mentor });
    if (this.canBeAdded(mentor)) {
      this.mentors.set(mentor.id.value, mentor);
      this.logger.debug('InMemoryMentorRepository.add : success', { mentor });
      return ok(mentor);
    }
    const error = new MentorAlreadyExistsException();
    this.logger.debug('InMemoryMentorRepository.add : failure', { error });
    return err(error);
  }

  delete(id: MentorId): Result<Mentor, Error> {
    this.logger.debug(`InMemoryMentorRepository.delete : execute - ${id.value}`, { id });
    this.logger.debug(`InMemoryMentorRepository : contains ${this.mentors.size}`, { id });
    if (this.mentors.has(id.value)) {
      const mentor = this.mentors.get(id.value);
      this.mentors.delete(id.value);
      this.logger.debug('InMemoryMentorRepository.delete : success', { id });
      return ok(mentor);
    }
    this.logger.debug('InMemoryMentorRepository.delete : failure', { id });
    return err(new MentorNotFoundException());
  }

  findWithIds(ids: MentorId[]): Result<Mentor[], Error> {
    this.logger.debug(`InMemoryMentorRepository.findWithIds : execute`, { ids });
    this.logger.debug(`InMemoryMentorRepository : contains ${this.mentors.size}`, { ids });
    const mentors = [...this.mentors.values()].filter((storedMentor) => ids.includes(storedMentor.id));
    return ok(mentors);
  }

  getByIds(ids: MentorId[]): Result<Mentor[], Error> {
    this.logger.debug(`InMemoryMentorRepository.getByIds : execute`, { ids });
    this.logger.debug(`InMemoryMentorRepository : contains ${this.mentors.size}`, { ids });
    const mentors = [...this.mentors.values()].filter((storedMentor) =>
      ids.map((id) => id.value).includes(storedMentor.id.value),
    );
    if (mentors.length === 0) {
      this.logger.debug('InMemoryMentorRepository.getByIds : failure', { ids });
      return err(new MentorNotFoundException());
    }
    if (mentors.length < ids.length) {
      this.logger.debug('InMemoryMentorRepository.getByIds : partial failure', { ids });
      return err(new MentorNotFoundException());
    }
    this.logger.debug('InMemoryMentorRepository.getByIds : success', { ids });
    return ok(mentors);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore typing error due to method overriding
  getMentorByUserId(userId: UserId): Result<Mentor, Error> {
    this.logger.debug(`InMemoryMentorRepository.getMentorByUserId : execute - ${userId.value}`, { userId });
    this.logger.debug(`InMemoryMentorRepository : contains ${this.mentors.size}`, { userId });
    const mentor = [...this.mentors.values()].find((mentor) => mentor.user.id.value === userId.value);
    if (mentor) {
      this.logger.debug('InMemoryMentorRepository.getMentorByUserId : success', { userId });
      return ok(mentor);
    }
    this.logger.debug('InMemoryMentorRepository.getMentorByUserId : failure', { userId });
    return err(new MentorNotFoundException());
  }

  update(mentor: Mentor): Result<Mentor, Error> {
    this.logger.debug(`InMemoryMentorRepository.update : execute - ${mentor.id.value}`, { mentor });
    this.logger.debug(`InMemoryMentorRepository : contains ${this.mentors.size}`, { mentor });
    const storedMentor = this.mentors.get(mentor.id.value);
    if (storedMentor) {
      this.mentors.set(mentor.id.value, mentor);
      this.logger.debug('InMemoryMentorRepository.update : success', { mentor });
      return ok(mentor);
    }
    this.logger.debug('InMemoryMentorRepository.update : failure', { mentor });
    return err(new MentorNotFoundException());
  }

  findAll(): Result<MentorId[], Error> {
    this.logger.debug('InMemoryMentorRepository.findAll : execute');
    this.logger.debug(`InMemoryMentorRepository : contains ${this.mentors.size}`);
    return ok([...this.mentors.keys()].map((id) => new MentorId(id)));
  }

  get(id: MentorId): Result<Mentor, Error> {
    this.logger.debug(`InMemoryMentorRepository.get : execute ${id.value}`, { id });
    this.logger.debug(`InMemoryMentorRepository : contains ${this.mentors.size}`, { id });
    if (this.mentors.has(id.value)) {
      return ok(this.mentors.get(id.value));
    } else err(new MentorNotFoundException());
  }

  count() {
    this.logger.debug('InMemoryMentorRepository.count : execute');
    this.logger.debug(`InMemoryMentorRepository : contains ${this.mentors.size}`);
    return this.mentors.size;
  }

  findByCriteria(criteria: MentorFindCriteria | undefined, order: OrderBy | undefined): Result<Mentor[], Error> {
    this.logger.debug('InMemoryMentorRepository.findByCriteria : execute', { criteria, order });
    this.logger.debug(`InMemoryMentorRepository : contains ${this.mentors.size}`, { criteria, order });
    const mentors = [...this.mentors.values()];
    const filteredMentors = this.findByCriteriaFilter(mentors, criteria);

    if (order && order.value === 'asc')
      filteredMentors.sort((a, b) => {
        const pricePricingPlansA = a.pricingPlans.map((pricingPlan) => pricingPlan.rate.amount.value);
        const pricePricingPlansB = b.pricingPlans.map((pricingPlan) => pricingPlan.rate.amount.value);

        const minimumPriceA = Math.min(...pricePricingPlansA);
        const minimumPriceB = Math.min(...pricePricingPlansB);

        return minimumPriceA - minimumPriceB;
      });
    if (order && order.value === 'desc') {
      filteredMentors.sort((a, b) => {
        const pricePricingPlansA = a.pricingPlans.map((pricingPlan) => pricingPlan.rate.amount.value);
        const pricePricingPlansB = b.pricingPlans.map((pricingPlan) => pricingPlan.rate.amount.value);

        const minimumPriceA = Math.max(...pricePricingPlansA);
        const minimumPriceB = Math.max(...pricePricingPlansB);

        return minimumPriceB - minimumPriceA;
      });
    }
    this.logger.debug('InMemoryMentorRepository.findByCriteria : success', { criteria, order });
    return ok(filteredMentors);
  }

  private findByCriteriaFilter(mentors: Mentor[], criteria: MentorFindCriteria) {
    this.logger.debug('InMemoryMentorRepository.findByCriteriaFilter : execute', { criteria });
    let filteredMentors = mentors;

    if (criteria.ids) {
      const criteriaIdValues = criteria.ids.map((id) => id.value);
      filteredMentors = filteredMentors.filter((mentor) => criteriaIdValues.includes(mentor.id.value));
    }

    if (criteria.availability) {
      filteredMentors = filteredMentors.filter((mentor) => mentor.availability.value === criteria.availability.value);
    }

    if (criteria.languages) {
      const criteriaLanguageValues = criteria.languages.map((language) => language.value);
      filteredMentors = filteredMentors.filter((mentor) => {
        const mentorLanguageValues = mentor.languages.map((language) => language.value);
        return criteriaLanguageValues.every((language) => mentorLanguageValues.includes(language));
      });
    }

    if (criteria.trainingType) {
      const criteriaTrainingTypeValues = criteria.trainingType.map((trainingType) => trainingType.value);

      filteredMentors = filteredMentors.filter((mentor) => {
        const mentorTrainingTypeValues = mentor.trainingType.map((trainingType) => trainingType.value);
        return criteriaTrainingTypeValues.every((trainingType) => mentorTrainingTypeValues.includes(trainingType));
      });
    }

    if (criteria.skills) {
      const criteriaSkillValues = criteria.skills.map((skill) => skill.name);

      filteredMentors = filteredMentors.filter((mentor) => {
        const mentorSkillValues = mentor.skills.map((skill) => skill.name);

        return criteriaSkillValues.every((skill) => mentorSkillValues.includes(skill));
      });
    }

    if (criteria.priceMin) {
      const matchingPriceMin = (mentor: Mentor, priceMin: Money) => {
        const pricingPlans = mentor.pricingPlans;
        return pricingPlans.some((pricingPlan) => pricingPlan.rate.amount.value >= priceMin.amount.value);
      };

      filteredMentors = filteredMentors.filter((mentor) => matchingPriceMin(mentor, criteria.priceMin));
    }

    if (criteria.priceMax) {
      const matchingPriceMax = (mentor: Mentor, priceMax: Money) => {
        const pricingPlans = mentor.pricingPlans;
        return pricingPlans.some((pricingPlan) => pricingPlan.rate.amount.value <= priceMax.amount.value);
      };
      filteredMentors = filteredMentors.filter((mentor) => matchingPriceMax(mentor, criteria.priceMax));
    }

    if (criteria.pricingType) {
      const matchingPricingType = (mentor: Mentor, pricingType: PricingType) => {
        const pricingPlans = mentor.pricingPlans.map((pricingPlan) => pricingPlan.pricingType.value.toString());
        return pricingPlans.includes(pricingType.value);
      };
      filteredMentors = filteredMentors.filter((mentor) => matchingPricingType(mentor, criteria.pricingType));
    }
    this.logger.debug('InMemoryMentorRepository.findByCriteriaFilter : success', { filteredMentors });
    return filteredMentors;
  }

  clear() {
    this.logger.debug('InMemoryMentorRepository.clear : execute');
    this.mentors.clear();
  }

  private canBeAdded(mentor: Mentor): boolean {
    this.logger.debug(`InMemoryMentorRepository.canBeAdded : execute - ${mentor.id.value}`, { mentor });
    this.logger.debug(`InMemoryMentorRepository : contains ${this.mentors.size}`, { mentor });
    const foundMentor = [...this.mentors.values()].find((m) => {
      return (
        m.id.value === mentor.id.value ||
        m.user.id.value === mentor.user.id.value ||
        mentor.user.email.value === m.user.email.value ||
        mentor.user?.person.id.value === m.user?.person.id.value
      );
    });
    this.logger.debug(`InMemoryMentorRepository.canBeAdded : ${!foundMentor}`, { mentor });
    return !foundMentor;
  }
}
