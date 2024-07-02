import { SkillAlreadyExistsError } from '../../domain/error/skill-already-exists';
import { ConflictException } from './conflict.exception';

export class SkillAlreadyExistsException extends ConflictException {
  readonly message = 'this skill is already registered';
  static readonly domainError: SkillAlreadyExistsError = { cause: 'skill already exists' };
  constructor(message?: string, metadata?: unknown) {
    super(message ?? SkillAlreadyExistsException.message, metadata, SkillAlreadyExistsException.domainError);
  }
}
