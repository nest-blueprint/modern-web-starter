import { ExceptionBase } from 'module/core/src/infrastructure/exception/base/base.exception';
import { ExceptionCode } from './code.exception';

export class NotProvidedArgumentCommandException extends ExceptionBase {
  public code = ExceptionCode.argumentNotProvided;
  constructor(message: string, metadata?: unknown) {
    super(message, metadata);
  }
}
