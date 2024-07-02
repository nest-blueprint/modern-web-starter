import { Result } from 'neverthrow';
import { Mentor } from '../../../domain/mentor';
import { Id as UserId } from '../../../domain/mentor/id';

export interface MentorRepositoryInterface {
  getMentorByUserId(userId: UserId): Promise<Result<Mentor, Error>> | Result<Mentor, Error>;
}
