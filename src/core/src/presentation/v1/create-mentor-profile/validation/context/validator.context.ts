import assert from 'assert';
import { CreateMentorProfileEntity } from '../../create-mentor-profile.entity';
import { BadRequestException } from '../../../../../infrastructure/exception/bad-request.exception';

export function ensureContextIsValid(createMentorProfile: CreateMentorProfileEntity) {
  const isValid =
    createMentorProfile.display_email ||
    (createMentorProfile.phone_number && createMentorProfile.display_phone_number) ||
    (createMentorProfile.linkedin && createMentorProfile.display_linkedin);

  assert(isValid, new BadRequestException('At least one contact method must be provided and visible'));
}
