import { ExceptionBase } from './base/base.exception';
import { ExceptionCode } from './code.exception';

export class RuntimeErrorException extends ExceptionBase {
  readonly code = ExceptionCode.runtimeError;
  constructor(message?: string, metadata?: unknown, domainError?: { cause: string }) {
    super(message, metadata, domainError);
  }
}
