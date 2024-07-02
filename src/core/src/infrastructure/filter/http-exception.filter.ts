import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  UnauthorizedException,
  Inject,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ConfigLoaderToken } from '../init/token.init';
import { ConfigLoaderService } from '../init/service/config-loader.service';
import { ApiProblem } from '../http/response/api-problem.response';

/**
 * Custom exception filter. Whereas the interceptor is used to catch and handle exceptions inside the application,
 * this exception filter is used to catch and handle exceptions before the controllers...
 * It manages the exceptions at a global scope.
 */

@Catch(UnauthorizedException, BadRequestException, InternalServerErrorException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(ConfigLoaderToken) private readonly config: ConfigLoaderService,
  ) {}
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const debugMode = this.config.get('application.STACK_TRACE');

    if (exception instanceof UnauthorizedException) {
      const problem = ApiProblem.fromNestException(
        exception,
        'request could not be satisfied.Missing or invalid authentication credentials',
        request.url,
        undefined,
        debugMode,
      );

      response.status(status).json(problem);
      return;
    }

    if (exception instanceof BadRequestException) {
      const problem = ApiProblem.fromNestException(
        exception,
        'request could not be satisfied.Invalid request',
        request.url,
        undefined,
        debugMode,
      );

      response.status(status).json(problem);
      return;
    }

    const problem = ApiProblem.fromNestException(
      exception,
      'request could not be satisfied. An error occurred while processing the request.',
      request.url,
      undefined,
      debugMode,
    );

    if (status === 500) {
      this.logger.error(`HttpExceptionFilter: error 500 occurred.`, exception.stack);
      response.status(status).json(problem);
    }
  }
}
