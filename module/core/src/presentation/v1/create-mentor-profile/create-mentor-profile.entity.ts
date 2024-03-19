import { Mentor, MentorProfileSettings, PersonDetail } from '../../../infrastructure/http/entity';

export type CreateMentorProfileEntity = Mentor & MentorProfileSettings & PersonDetail;
