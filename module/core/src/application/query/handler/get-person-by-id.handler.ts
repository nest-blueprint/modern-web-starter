import { Inject, Injectable } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { QueryHandlerInterface } from '../../interface/query-handler.interface';
import { GetPersonQuery } from '../get-person.query';
import { Id } from '../../../domain/person/id';
import { PersonCollection } from '../../../domain/collection/person.collection';
import { Person } from '../../../domain/person';

import { PersonCollectionToken } from '../../../infrastructure/repository/factory/token.factory';
import { PersonNotFoundException } from '../../../infrastructure/exception/person-not-found.exception';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@QueryHandler(GetPersonQuery)
export class GetPersonByIdHandler implements QueryHandlerInterface {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(PersonCollectionToken) private readonly personRepository: PersonCollection,
  ) {}
  async execute(query: GetPersonQuery): Promise<Person> {
    this.logger.debug('GetPersonByIdHandler.execute', { query });
    const person_id = new Id(query.id);
    const queryResult = await this.personRepository.get(person_id);
    if (queryResult.isErr()) {
      throw new PersonNotFoundException();
    }
    this.logger.debug('GetPersonByIdHandler.execute : success.', { person: queryResult.value });
    return queryResult.value;
  }
}
