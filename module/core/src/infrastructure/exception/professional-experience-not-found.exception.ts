import { NotFoundException } from './not-found.exception';
import { ProfessionalExperienceNotFoundError } from '../../domain/error/professional-experience-not-found';

export class ProfessionalExperienceNotFoundException extends NotFoundException {
  readonly message = 'Professional professional-experience not found';
  static readonly domainError: ProfessionalExperienceNotFoundError = {
    cause: 'professional experience not found',
  };
  constructor(message?: string, metadata?: string) {
    super(
      message ?? ProfessionalExperienceNotFoundException.message,
      metadata,
      ProfessionalExperienceNotFoundException.domainError,
    );
  }
}
