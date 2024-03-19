import { ExceptionBase } from 'module/core/src/infrastructure/exception/base/base.exception';
import { ExceptionCode } from './code.exception';

export class OutOfRangeArgumentCommandException extends ExceptionBase {
  public code = ExceptionCode.argumentOutOfRange;
  constructor(message: string, metadata?: unknown) {
    super(message, metadata);
  }
}
