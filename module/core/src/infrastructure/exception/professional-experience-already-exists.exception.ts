import { ProfessionalExperienceAlreadyExistsError } from '../../domain/error/professional-experience-already-exists';
import { ConflictException } from './conflict.exception';

export class ProfessionalExperienceAlreadyExistsException extends ConflictException {
  readonly message = 'professional experience already exists';
  static readonly domainError: ProfessionalExperienceAlreadyExistsError = {
    cause: 'professional experience already exists',
  };
  constructor(message?: string, metadata?: unknown) {
    super(
      message ?? ProfessionalExperienceAlreadyExistsException.message,
      metadata,
      ProfessionalExperienceAlreadyExistsException.domainError,
    );
  }
}
