/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Mentor } from './mentor.entity';
import type { MentorProfileSettings } from './mentor-profile-settings.entity';
import type { PersonDetail } from './person-detail.entity';

export type AccountDataMentor = Mentor & MentorProfileSettings & PersonDetail;
