import { ExceptionBase } from '../../../infrastructure/exception/base/base.exception';
import { ExceptionCode } from './code.exception';

export class InvalidArgumentCommandException extends ExceptionBase {
  public code = ExceptionCode.argumentInvalid;
  constructor(message: string, metadata?: unknown) {
    super(message, metadata);
  }
}
