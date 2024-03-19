import { ConflictException } from './conflict.exception';
import { ProfessionalExperienceCreationFailedError } from '../../domain/error/professional-experience-creation-failed';

export class ProfessionalExperienceCreationFailedException extends ConflictException {
  readonly message = 'professional experience creation failed';
  static readonly domainError: ProfessionalExperienceCreationFailedError = {
    cause: 'professional experience creation failed',
  };
  constructor(message?: string, metadata?: unknown) {
    super(
      message ?? ProfessionalExperienceCreationFailedException.message,
      metadata,
      ProfessionalExperienceCreationFailedException.domainError,
    );
  }
}
