import { Skill } from '../skill';
import { Id as SkillId } from './../skill/id';
import { Id as MentorId } from '../mentor/id';
export interface SkillCollection {
  add: (skill: Skill) => any;
  update: (skill: Skill) => any;
  delete: (id: SkillId) => any;
  get: (id: SkillId) => any;
  getSkillByName: (skill: Skill) => any;
  setMentorSkills: (mentorId: MentorId, skill: Skill[]) => any;
  cleanMentorSkills: (mentorId: MentorId) => any;
  upsertSkill: (skill: Skill[]) => any;
  getFromMentor: (mentorId: MentorId) => any;
}
