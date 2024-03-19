import { BadRequestException } from '../../../exception/bad-request.exception';

export class RequestBodyValidationFailedException extends BadRequestException {
  readonly message = 'the request body provided by the client is not valid';
  constructor(public readonly errors: Array<{ path: string; expected: string; value: any }>, metadata?: any) {
    super(RequestBodyValidationFailedException.message, metadata);
  }
}
