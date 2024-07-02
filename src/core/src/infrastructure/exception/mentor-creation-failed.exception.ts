import { ConflictException } from './conflict.exception';
import { MentorCreationFailedError } from '../../domain/error/mentor-creation-failed';

export class MentorCreationFailedException extends ConflictException {
  readonly message = 'Mentor creation failed';
  static readonly domainError: MentorCreationFailedError = { cause: 'mentor creation failed' };
  constructor(message?: string, metadata?: unknown) {
    super(message ?? MentorCreationFailedException.message, metadata, MentorCreationFailedException.domainError);
  }
}
