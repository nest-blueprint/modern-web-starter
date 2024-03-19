import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { error } from 'express-openapi-validator';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ApiProblem } from '../http/response/api-problem.response';
import { ConfigLoaderToken } from '../init/token.init';
import { ConfigLoaderService } from '../init/service/config-loader.service';

/**
 * Custom exception filter. Declared on the main top scope module (Appmodule).
 * this filter is a guard for the exceptions before any request reaches the handlers.
 */

@Catch(...Object.values(error))
export class OpenApiExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(ConfigLoaderToken) private readonly configService: ConfigLoaderService,
  ) {}

  catch(
    error: {
      status: number;
      path: string;
      headers: any;
      errors: Array<{ path: string; message: string; errorCode: string }>;
    },
    host: ArgumentsHost,
  ) {
    const debugMode = this.configService.get('application.STACK_TRACE');

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const errors = error.errors.map(({ path, message }) => ({
      name: path.split('.')[path.split('.').length - 1],
      reason: message.replace(/['"]+/g, ''),
    }));

    if (error.status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`OpenApiExceptionFilter: internal server error - ${JSON.stringify(errors)} `, {
        instance: request.route.path,
        message: error.errors[0].message,
        error,
      });

      const problem = ApiProblem.fromNestException(
        new InternalServerErrorException(),
        'Internal server error',
        request.url,
        undefined,
        debugMode,
      );
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(problem);
      return;
    }

    if (error.status === HttpStatus.BAD_REQUEST) {
      const problem = ApiProblem.fromNestException(
        new BadRequestException(),
        'the request will not be processed, it does not match the requirements',
        request.url,
        { errors },
        debugMode,
      );

      this.logger.info(`OpenApiExceptionFilter: request rejected`, request.body);

      response.status(HttpStatus.BAD_REQUEST).json(problem);
      return;
    }

    // All other errors not handled by the previous if statements are considered as internal server errors.
    const problem = ApiProblem.fromNestException(
      new InternalServerErrorException(),
      'Internal server error',
      request.url,
      undefined,
      debugMode,
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(problem);
    return;
  }
}
