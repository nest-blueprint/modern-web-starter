import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  // To avoid confusion between internal app exceptions and NestJS exceptions
  ConflictException as NestConflictException,
  NotFoundException as NestNotFoundException,
  BadRequestException as NestBadRequestException,
  InternalServerErrorException as NestInternalApplicationException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotFoundException } from '../exception/not-found.exception';
import { ExceptionBase } from '../exception/base/base.exception';
import { ConflictException } from '../exception/conflict.exception';

import { ConfigLoaderService } from '../init/service/config-loader.service';
import { BadRequestException } from '../exception/bad-request.exception';
import { InvalidValueProvidedException } from '../exception/invalid-value-provided.exception';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ApiProblem } from '../http/response/api-problem.response';
import { RequestBodyValidationFailedException } from '../http/validation/exception/request-body-validation-failed.exception';
import { RequestValidationFailedException } from '../http/validation/exception/request-validation-failed.exception';

/**
 * This interceptor will catch all exceptions thrown by the application inside the Http handlers functions, but does not catch exceptions thrown before the handlers
 * (middlewares, guards, pipes...).
 */

export class ExceptionInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly config: ConfigLoaderService,
  ) {}
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ExceptionBase> {
    return next.handle().pipe(
      catchError((error) => {
        /**
         * Custom exceptions are converted to nest.js exceptions.
         * This way we are not tied to a framework or HTTP protocol.
         */

        const request = _context.switchToHttp().getRequest();
        const instance = request.route.path;
        const debugMode = this.config.get('application.STACK_TRACE') && error.serialize ? error.serialize() : undefined;
        const message = error.message;

        this.logger.info(`ExceptionInterceptor: application exception : ${error.constructor.name}`, {
          instance,
          message,
        });

        if (error instanceof NotFoundException) {
          const problem = ApiProblem.fromApplicationException(
            error,
            HttpStatus.NOT_FOUND,
            undefined,
            NotFoundException.message,
            instance,
            undefined,
            debugMode,
          );

          throw new NestNotFoundException(problem);
        }

        if (error instanceof ConflictException) {
          const problem = ApiProblem.fromApplicationException(
            error,
            HttpStatus.CONFLICT,
            undefined,
            message,
            instance,
            undefined,
            debugMode,
          );

          throw new NestConflictException(problem);
        }

        if (
          error instanceof RequestBodyValidationFailedException ||
          error instanceof RequestValidationFailedException
        ) {
          const problem = ApiProblem.fromApplicationException(
            error,
            HttpStatus.BAD_REQUEST,
            undefined,
            message,
            instance,
            { errors: error.errors },
            debugMode,
          );
          throw new NestBadRequestException(problem);
        }

        if (error instanceof InvalidValueProvidedException) {
          const problem = ApiProblem.fromApplicationException(
            error,
            HttpStatus.BAD_REQUEST,
            undefined,
            message,
            instance,
            undefined,
            debugMode,
          );
          throw new NestBadRequestException(problem);
        }

        if (error instanceof BadRequestException) {
          const problem = ApiProblem.fromApplicationException(
            error,
            HttpStatus.BAD_REQUEST,
            undefined,
            message,
            instance,
            undefined,
            debugMode,
          );
          throw new NestBadRequestException(problem);
        }

        const problem = ApiProblem.fromApplicationException(
          error,
          HttpStatus.INTERNAL_SERVER_ERROR,
          'internal server error',
          message,
          instance,
          undefined,
          debugMode,
        );

        this.logger.error(error.message, error);
        return throwError(() => new NestInternalApplicationException(problem));
      }),
    );
  }
}
