import { BadRequestException } from '../../../exception/bad-request.exception';

export class RequestValidationFailedException extends BadRequestException {
  readonly message = 'the request provided by the client is not valid';
  constructor(public readonly errors: Array<{ path: string; expected: string; value: any }>, metadata?: any) {
    super(RequestValidationFailedException.message, metadata);
  }
}
