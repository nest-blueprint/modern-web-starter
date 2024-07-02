import { ExceptionBase } from './base/base.exception';
import { ExceptionCode } from './code.exception';

export class InvalidValueProvidedException extends ExceptionBase {
  code: ExceptionCode.invalidValueProvided;
  static readonly message = 'invalid value provided';
  constructor(message?: string, metadata?: unknown, domainError?: { cause: string }) {
    super(message, metadata, domainError);
  }
}
