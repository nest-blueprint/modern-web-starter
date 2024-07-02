import { ExceptionBase } from './base/base.exception';
import { ExceptionCode } from './code.exception';

export class ForbiddenException extends ExceptionBase {
  readonly code = ExceptionCode.forbidden;

  static readonly message = 'forbidden';
  constructor(message?: string, metadata?: unknown, domainError?: { cause: string }) {
    super(message ?? ForbiddenException.message, metadata, domainError);
  }
}
