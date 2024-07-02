import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Id as MentorId } from '../../../domain/mentor/id';
import { QueryHandlerInterface } from '../../interface/query-handler.interface';
import { MentorCollection } from '../../../domain/collection/mentor.collection';
import { FindMentorIdsQuery } from '../find-mentor-ids.query';
import { MentorCollectionToken } from '../../../infrastructure/repository/factory/token.factory';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@QueryHandler(FindMentorIdsQuery)
export class FindMentorIdsHandler implements QueryHandlerInterface {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(MentorCollectionToken) private readonly mentorCollection: MentorCollection,
  ) {}

  async execute(query: FindMentorIdsQuery): Promise<MentorId[]> {
    this.logger.debug('FindMentorIdsHandler.execute', { query });
    const result = await this.mentorCollection.findAll();
    if (result.isErr()) throw result.error;
    this.logger.debug('FindMentorIdsHandler.execute : success');
    return result.value;
  }
}
