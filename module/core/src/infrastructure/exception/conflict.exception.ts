import { ExceptionBase } from './base/base.exception';
import { ExceptionCode } from './code.exception';

export class ConflictException extends ExceptionBase {
  static readonly message = 'resource already exists or is in conflict with another resource';
  readonly code = ExceptionCode.conflict;
  constructor(message?: string, metadata?: unknown, domainError?: { cause: string }) {
    super(message ?? ConflictException.message, metadata, domainError);
  }
}
