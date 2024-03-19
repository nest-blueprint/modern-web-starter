import { Controller, Get, HttpCode, HttpStatus, Param, Query, Request } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { QueryBus } from '@nestjs/cqrs';
import { routesV1 } from '../../../../config/routes-v1';
import { FindMentorIdsQuery } from '../../../application/query/find-mentor-ids.query';
import { FindMentorMatchingCriteriaQuery } from '../../../application/query/find-mentor-matching-criteria.query';
import { getMentorPublicProfile } from './util/get-mentor.util';
import { GetMentorEntity } from './get-mentor.entity';
import { validate } from 'typia';
import { RequestValidationFailedException } from '../../../infrastructure/http/validation/exception/request-validation-failed.exception';
import { TypedQueryParam } from '../../../infrastructure/http/param/decorator/typed-param.decorator';
import { tryParseInt } from '../../../infrastructure/util/function.util';

@Controller(routesV1.mentor.get)
export class GetMentorHttpHandler {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getMentor(
    @Request() request: ExpressRequest,
    @Query() params: GetMentorEntity & { price_min?: string; price_max?: string; languages?: string | Array<string> },
    @TypedQueryParam({ name: 'mentor_id', type: 'uuid', nullable: true }) mentorId: string,
  ) {
    const parsedQueryParams: GetMentorEntity = this.parseStringsFromEntity(params);
    this.ensureIsValidEntity(parsedQueryParams);

    const findMentorIdsQuery = new FindMentorIdsQuery([]);
    const findMentorIdsQueryResult = await this.queryBus.execute(findMentorIdsQuery);

    const mentorIds = findMentorIdsQueryResult.map((mentorId) => mentorId.value);

    const findMentorMatchingCriteriaQuery = new FindMentorMatchingCriteriaQuery(
      mentorIds,
      parsedQueryParams?.price_max,
      parsedQueryParams?.price_min,
      parsedQueryParams?.price,
      parsedQueryParams?.pricing_type,
      parsedQueryParams?.training_type,
      parsedQueryParams?.mentor_availability,
      parsedQueryParams?.languages,
      parsedQueryParams?.specializations,
    );

    const mentorMatchingCriteria = await this.queryBus.execute(findMentorMatchingCriteriaQuery);

    return mentorMatchingCriteria.map((mentor) => getMentorPublicProfile(mentor));
  }

  private parseStringsFromEntity(params: GetMentorEntity & { price_min?: string; price_max?: string }) {
    const parsedQueryParams: GetMentorEntity = { ...params };
    if (params.price_min) {
      parsedQueryParams.price_min = tryParseInt(params.price_min).isOk()
        ? tryParseInt(params.price_min).unwrapOr(null)
        : null;
      if (parsedQueryParams.price_min === null) {
        throw new RequestValidationFailedException([
          { path: 'price_min', expected: 'integer', value: params.price_min },
        ]);
      }
    }
    if (params.price_max) {
      parsedQueryParams.price_max = tryParseInt(params.price_max).isOk()
        ? tryParseInt(params.price_max).unwrapOr(null)
        : null;
      if (parsedQueryParams.price_max === null) {
        throw new RequestValidationFailedException([
          { path: 'price_max', expected: 'integer', value: params.price_min },
        ]);
      }
    }
    if (params.languages) {
      parsedQueryParams.languages = Array.isArray(params.languages) ? params.languages : [params.languages];
    }
    if (params.training_type) {
      parsedQueryParams.training_type = Array.isArray(params.training_type)
        ? params.training_type
        : [params.training_type];
    }

    return parsedQueryParams;
  }
  private ensureIsValidEntity(params: GetMentorEntity) {
    const validationResult = validate<GetMentorEntity>(params);
    if (!validationResult.success) {
      throw new RequestValidationFailedException(validationResult.errors);
    }
  }
}
