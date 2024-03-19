import { ProfessionalExperience } from '../professional-experience';
import { Id as MentorId } from '../mentor/id';
import { Id as ExperienceId } from '../professional-experience/id';
export interface ProfessionalExperienceCollection {
  add: (professionalExperience: ProfessionalExperience) => any;
  delete: (id: ExperienceId) => any;
  update: (professionalExperience: ProfessionalExperience) => any;
  getFromMentor: (id: MentorId) => any;
  findFromMentor: (id: MentorId) => any;
}
