import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Id as MentorId } from '../../../domain/mentor/id';
import { QueryHandlerInterface } from '../../interface/query-handler.interface';
import { MentorCollection } from '../../../domain/collection/mentor.collection';
import { Mentor } from '../../../domain/mentor';
import { GetMentorByIdsQuery } from '../get-mentor-by-ids.query';
import { MentorCollectionToken } from '../../../infrastructure/repository/factory/token.factory';
import { InvalidValueProvidedException } from '../../../infrastructure/exception/invalid-value-provided.exception';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@QueryHandler(GetMentorByIdsQuery)
export class GetMentorByIdsHandler implements QueryHandlerInterface {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(MentorCollectionToken) private readonly mentorCollection: MentorCollection,
  ) {}

  async execute(query: GetMentorByIdsQuery): Promise<Mentor[]> {
    this.logger.debug('GetMentorByIdsHandler.execute', { query });
    if (!query.ids || query.ids.length === 0) {
      throw new InvalidValueProvidedException('At least one mentor id must be provided');
    }
    const ids = query.ids.map((id) => new MentorId(id));
    const result = await this.mentorCollection.getByIds(ids);

    if (result.isErr()) {
      throw result.error;
    }
    this.logger.debug('GetMentorByIdsHandler.execute : success', { mentors: result.value });
    return result.value;
  }
}
