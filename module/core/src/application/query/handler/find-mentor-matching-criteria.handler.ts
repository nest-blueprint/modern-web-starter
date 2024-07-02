import { QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { err, ok } from 'neverthrow';
import { QueryHandlerInterface } from '../../interface/query-handler.interface';
import { Id as MentorId } from '../../../domain/mentor/id';
import { MentorCollection } from '../../../domain/collection/mentor.collection';
import { FindMentorMatchingCriteriaQuery } from '../find-mentor-matching-criteria.query';
import { Availability } from '../../../domain/mentor/availability';
import { Language } from '../../../domain/language';
import { Type as TrainingType } from '../../../domain/training/type';
import { Money } from '../../../domain/money';
import { Type as PricingType } from '../../../domain/pricing/type';
import { Mentor } from '../../../domain/mentor';
import { MentorCollectionToken, SkillCollectionToken } from '../../../infrastructure/repository/factory/token.factory';
import { SkillCollection } from '../../../domain/collection/skill.collection';
import { Skill } from '../../../domain/skill';
import { SkillNotFoundException } from '../../../infrastructure/exception/skill-not-found.excpetion';
import { OrderBy } from '../../../domain/order-by';
import { MentorFindCriteria } from '../../../infrastructure/type/mentor-find-criteria.type';
import { InvalidArgumentCommandException } from '../../exception/command/invalid-argument-command.exception';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@QueryHandler(FindMentorMatchingCriteriaQuery)
export class FindMentorMatchingCriteriaHandler implements QueryHandlerInterface {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(MentorCollectionToken) private readonly mentorCollection: MentorCollection,
    @Inject(SkillCollectionToken) private readonly skillCollection: SkillCollection,
  ) {}

  async execute(query: FindMentorMatchingCriteriaQuery): Promise<Mentor[]> {
    this.logger.debug(`FindMentorMatchingCriteriaHandler.execute`, { query });
    let skillCriteriaList: Skill[] = [];
    if (query.skills) {
      const skillResults = await this.getSkillsFromDatabase(query.skills);
      if (skillResults.isErr()) throw skillResults.error;
      skillCriteriaList = skillCriteriaList.concat(skillResults.value);
    }

    const { mentorFindCriteria, order } = this.getSearchCriteria(query, query.mentorsIds, skillCriteriaList);

    const result = await this.mentorCollection.findByCriteria(mentorFindCriteria, order);

    if (result.isErr()) throw result.error;
    this.logger.debug(`FindMentorMatchingCriteriaHandler.execute : success`, { result: result.value });
    return result.value;
  }

  getSearchCriteria(query: FindMentorMatchingCriteriaQuery, mentorIds: string[], skills: Skill[]) {
    try {
      const mentorFindCriteria: MentorFindCriteria = this.mapMentorFindCriteria(query, query.mentorsIds, skills);

      const order = query.order ? OrderBy.fromString(query.order) : undefined;

      return { mentorFindCriteria, order };
    } catch (error: any) {
      throw new InvalidArgumentCommandException(
        'Invalid arguments passed to the query handler : FindMentorMatchingCriteria ',
        error,
      );
    }
  }

  private async getSkillsFromDatabase(skills: string[]) {
    try {
      const mappedSkillResult: Array<Skill | null> = await Promise.all(
        skills.map(async (skill) => {
          const skillDomainObject = Skill.create(skill);
          const skillResult = await this.skillCollection.getSkillByName(skillDomainObject);

          if (skillResult.isErr()) throw skillResult.error;

          return skillResult.value;
        }),
      );

      //If any of the skills is not found, return an exception
      if (mappedSkillResult.some((result) => result === null)) {
        return err(
          new SkillNotFoundException(
            `Some provided skills in the list (${skills.join(
              ',',
            )}) are unknown. Thus, no mentor can be found. with these skills.`,
          ),
        );
      }

      //At this point all skills are found, defined and mapped.
      return ok(mappedSkillResult);
    } catch (error: any) {
      throw new InvalidArgumentCommandException(
        'Invalid arguments passed to the query handler : FindMentorMatchingCriteria ',
        error,
      );
    }
  }

  private mapMentorFindCriteria(
    query: FindMentorMatchingCriteriaQuery,
    ids: string[],
    skills?: Skill[],
  ): MentorFindCriteria {
    const criteria = {};

    if (query.mentorAvailability) {
      criteria['availability'] = Availability.fromString(query.mentorAvailability);
    }
    if (query.languages) {
      criteria['languages'] = query.languages.map((language) => Language.fromString(language));
    }
    if (query.trainingType) {
      criteria['trainingType'] = query.trainingType.map((type) => TrainingType.fromString(type));
    }
    if (query.priceMin) {
      criteria['priceMin'] = Money.fromStringValues(query.priceMin);
    }
    if (query.priceMax) {
      criteria['priceMax'] = Money.fromStringValues(query.priceMax);
    }
    if (query.pricingType) {
      criteria['pricingType'] = PricingType.fromString(query.pricingType);
    }
    if (query.skills) {
      criteria['skills'] = skills;
    }
    return {
      ids: ids.map((id) => new MentorId(id)),
      ...criteria,
    };
  }
}
