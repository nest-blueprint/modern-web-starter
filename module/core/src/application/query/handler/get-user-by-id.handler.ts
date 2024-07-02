import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { GetUserByIdQuery } from '../get-user-by-id.query';
import { Id } from '../../../domain/user/id';
import { QueryHandlerInterface } from '../../interface/query-handler.interface';
import { User } from '../../../domain/user';
import { UserCollection } from '../../../domain/collection/user.collection';
import { UserCollectionToken } from '../../../infrastructure/repository/factory/token.factory';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements QueryHandlerInterface {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(UserCollectionToken) private readonly userCollection: UserCollection,
  ) {}

  async execute(query: GetUserByIdQuery): Promise<User> {
    this.logger.debug('GetUserByIdHandler.execute', { query });
    const id = new Id(query.id);
    const result = await this.userCollection.get(id);
    if (result.isErr()) throw result.error;
    this.logger.debug('GetUserByIdHandler.execute : success', { user: result.value });
    return result.value;
  }
}
