import { SkillNotFoundError } from '../../domain/error/skill-not-found';
import { NotFoundException } from './not-found.exception';

export class SkillNotFoundException extends NotFoundException {
  readonly message: 'skill not found';
  static readonly domainError: SkillNotFoundError = { cause: 'skill not found' };
  constructor(message?: string, metadata?: unknown) {
    super(message ?? SkillNotFoundException.message, metadata, SkillNotFoundException.domainError);
  }
}
