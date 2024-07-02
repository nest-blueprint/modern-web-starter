import { ExceptionBase } from './base/base.exception';
import { ExceptionCode } from './code.exception';

export class BadRequestException extends ExceptionBase {
  readonly code = ExceptionCode.badRequest;

  static readonly message = 'bad request';

  constructor(message?: string, metadata?: unknown, domainError?: { cause: string }) {
    super(message ?? BadRequestException.message, metadata, domainError);
  }
}
