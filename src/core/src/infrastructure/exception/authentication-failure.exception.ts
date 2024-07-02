import { ForbiddenException } from './forbidden.exception';
import { ExceptionCode } from './code.exception';

export class AuthenticationFailureException extends ForbiddenException {
  readonly code = ExceptionCode.forbidden;
  readonly message: 'authentication failed or not provided';
  constructor(message?: string, metadata?: unknown) {
    super(message ?? AuthenticationFailureException.message, metadata);
  }
}
