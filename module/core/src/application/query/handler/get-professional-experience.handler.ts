import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { QueryHandlerInterface } from '../../interface/query-handler.interface';
import { GetProfessionalExperienceQuery } from '../get-professional-experience.query';
import { ProfessionalExperience } from '../../../domain/professional-experience';
import { Id as ExperienceId } from '../../../domain/professional-experience/id';
import { Id as MentorId } from '../../../domain/mentor/id';
import { ProfessionalExperienceCollectionToken } from '../../../infrastructure/repository/factory/token.factory';
import { ProfessionalExperienceCollection } from '../../../domain/collection/professional-experience.collection';
import { InvalidValueProvidedException } from '../../../infrastructure/exception/invalid-value-provided.exception';
import { ProfessionalExperienceNotFoundException } from '../../../infrastructure/exception/professional-experience-not-found.exception';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@QueryHandler(GetProfessionalExperienceQuery)
export class GetProfessionalExperienceHandler implements QueryHandlerInterface {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(ProfessionalExperienceCollectionToken) private readonly repository: ProfessionalExperienceCollection,
  ) {}

  async execute(query: GetProfessionalExperienceQuery): Promise<ProfessionalExperience[]> {
    this.logger.debug('GetProfessionalExperienceHandler.execute', { query });
    const mentorId = new MentorId(query.mentorId);
    const experiencesIds = query.experiencesIds.map((id) => new ExperienceId(id));
    if (experiencesIds.length === 0) {
      throw new InvalidValueProvidedException('At least one professional-experience id is required');
    }
    const getQueryResult = await this.repository.getFromMentor(mentorId);
    if (getQueryResult.isErr()) {
      throw getQueryResult.error;
    }

    // Compare ids from query and ids from repository
    return this.matchMentorProfessionalExperiences(getQueryResult, experiencesIds, mentorId);
  }

  private matchMentorProfessionalExperiences(getQueryResult, experiencesIds: ExperienceId[], mentorId: MentorId) {
    const experiences = getQueryResult.value.filter((experience) =>
      experiencesIds.map((experienceId) => experienceId.value).includes(experience.id.value),
    );
    if (experiences.length === 0) {
      throw new ProfessionalExperienceNotFoundException(
        `No professional experience found for mentor: ${mentorId.value}`,
      );
    }
    this.logger.debug('GetProfessionalExperienceHandler.execute : success', { experiences });
    return experiences;
  }
}
