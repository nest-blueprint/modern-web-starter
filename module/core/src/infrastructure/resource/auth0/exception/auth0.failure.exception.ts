import { ExceptionBase } from '../../../exception/base/base.exception';
import { ExceptionCode } from '../../../exception/code.exception';

export class Auth0FailureException extends ExceptionBase {
  code: ExceptionCode.externalProviderError;
  static readonly message = 'Unexpected error while requesting Auth0 provider';

  constructor(message?: string, metadata?: unknown) {
    super(message ?? Auth0FailureException.message, metadata);
  }
}
