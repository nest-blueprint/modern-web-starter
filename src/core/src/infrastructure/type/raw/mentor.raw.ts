import { MentorSettings } from './mentor-settings.raw';
import { Skill } from './skill.raw';
import { ProfessionalExperience } from './professional-experience.raw';
import { PricingPlan } from './pricing-plan.raw';
import { User } from './user.raw';

export type Mentor = {
  mentor_id: string;
  user: User;
  profile_description: string;
  availability: string;
  languages: string;
  training_type: string;
  settings: MentorSettings;
  skills: Array<Skill>;
  professional_experiences: Array<ProfessionalExperience>;
  pricing_plans: Array<PricingPlan>;
  current_job: string | null;
  profile_title: string | null;
};
