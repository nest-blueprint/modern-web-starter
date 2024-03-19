import { ExceptionBase } from './base/base.exception';
import { ExceptionCode } from './code.exception';

export class NotFoundException extends ExceptionBase {
  static readonly message = 'resource not found';
  constructor(message?: string, metadata?: unknown, domainError?: { cause: string }) {
    super(message, metadata, domainError);
  }
  readonly code = ExceptionCode.notFound;
}
