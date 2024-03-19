import { MentorAlreadyExistsError } from '../../domain/error/mentor-already-exists';
import { ConflictException } from './conflict.exception';

export class MentorAlreadyExistsException extends ConflictException {
  readonly message: 'mentor already exists';
  static domainError: MentorAlreadyExistsError = { cause: 'mentor already exists' };
  constructor(message?: string, metadata?: unknown) {
    super(message ?? MentorAlreadyExistsException.message, metadata, MentorAlreadyExistsException.domainError);
  }
}
