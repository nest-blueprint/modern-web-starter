import { MentorNotFoundError } from '../../domain/error/mentor-not-found';
import { NotFoundException } from './not-found.exception';

export class MentorNotFoundException extends NotFoundException {
  readonly message: 'Mentor not found';
  static readonly domainError: MentorNotFoundError = { cause: 'mentor not found' };
  constructor(message?: string, metadata?: unknown) {
    super(message ?? MentorNotFoundException.message, metadata, MentorNotFoundException.domainError);
  }
}
