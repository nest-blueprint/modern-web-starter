import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionBase } from '../../exception/base/base.exception';
import { toSentenceCase } from '../../util/function.util';

export class ApiProblem {
  public readonly status: HttpStatus;
  public title?: string;
  public instance?: string;
  public detail?: string;
  public additional?: unknown;
  public trace?: string;

  constructor({
    status,
    title,
    instance,
    detail,
    additional,
    trace,
  }: {
    status: HttpStatus;
    title?: string;
    instance?: string;
    detail?: string;
    additional?: unknown;
    trace?: string;
  }) {
    this.status = status;
    this.title = title;
    this.instance = instance;
    this.detail = detail;
    this.additional = additional;
    this.trace = trace;
  }

  static fromNestException(
    exception: HttpException,
    message?: string,
    instance?: string,
    additional?: Record<string, unknown>,
    debug = false,
  ) {
    return new ApiProblem({
      status: exception.getStatus(),
      title: toSentenceCase(exception.name),
      detail: message ?? undefined,
      instance,
      additional: {
        ...additional,
        message: debug ? exception.message : undefined,
        stack: debug ? exception.stack : undefined,
        exception: debug ? exception.cause : undefined,
      },
    });
  }

  static fromApplicationException(
    exception: ExceptionBase,
    status: HttpStatus,
    title?: string,
    message?: string,
    instance?: string,
    additional?: Record<string, unknown>,
    debug = false,
  ) {
    return new ApiProblem({
      status,
      title: title ? title : exception.domainError?.cause ?? toSentenceCase(exception.name),
      detail: message ? message : exception.message, //  Application exception message does not contain sensitive information, whereas Nest.js exception message does.
      instance,
      additional: {
        ...additional,
        stack: debug ? exception.stack : undefined,
        metadata: debug ? exception.metadata : undefined,
      },
    });
  }
}
