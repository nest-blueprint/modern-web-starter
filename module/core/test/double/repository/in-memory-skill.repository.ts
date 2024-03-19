import { SkillCollection } from '../../../src/domain/collection/skill.collection';
import { Skill } from '../../../src/domain/skill';
import { Id as SkillId } from '../../../src/domain/skill/id';
import { Id as MentorId } from '../../../src/domain/mentor/id';
import { err, ok, Result } from 'neverthrow';
import { SkillAlreadyExistsException } from '../../../src/infrastructure/exception/skill-already-exists-exception';
import { SkillNotFoundException } from '../../../src/infrastructure/exception/skill-not-found.excpetion';
import { MentorNotFoundException } from '../../../src/infrastructure/exception/mentor-not-found.exception';

export class InMemorySkillRepository implements SkillCollection {
  private _skills: Map<string, Skill> = new Map(); // Map<skillId, skill>
  private _mentorSkills: Map<string, Skill[]> = new Map(); // Map<mentorId, skills>
  add(skill: Skill): Result<Skill, Error> {
    if (this._skills.has(skill.id.value)) {
      return err(new SkillAlreadyExistsException());
    }
    this._skills.set(skill.id.value, skill);
    return ok(skill);
  }

  delete(id: SkillId): Result<Skill, Error> {
    if (this._skills.has(id.value)) {
      const skill = this._skills.get(id.value);
      this._skills.delete(id.value);
      return ok(skill);
    }
    return err(new SkillNotFoundException());
  }

  getSkillByName(searchedSkill: Skill): Result<Skill | null, Error> {
    const skill = [...this._skills.values()].find((skill) => skill.name === searchedSkill.name);
    if (skill) return ok(skill);
    return ok(null);
  }

  get(id: SkillId): Result<Skill, Error> {
    if (this._skills.has(id.value)) {
      const skill = this._skills.get(id.value);
      return ok(skill);
    }
    return err(new SkillNotFoundException());
  }

  getFromMentor(mentorId: MentorId): Result<Skill[], Error> {
    if (!this._mentorSkills.has(mentorId.value)) {
      return err(new MentorNotFoundException());
    }
    const skills = [...this._mentorSkills.entries()]
      .filter((entry) => entry[0] === mentorId.value)
      .map((entry) => entry[1])
      .flat();
    return ok(skills);
  }

  update(skill: Skill): Result<Skill, Error> {
    if (this._skills.has(skill.id.value)) {
      this._skills.set(skill.id.value, skill);
      return ok(skill);
    }
    return err(new SkillNotFoundException());
  }

  setMentorSkills(mentorId: MentorId, skills: Skill[]): Result<Skill[], Error> {
    if (!this._mentorSkills.has(mentorId.value)) {
      this._mentorSkills.set(mentorId.value, []);
    }
    const newSkills = [...this._skills.values()].filter(
      (skill) => !skills.map((skillObj) => skillObj.id.value).includes(skill.id.value),
    );
    newSkills.forEach((skill) => {
      this._skills.set(skill.id.value, skill);
    });
    skills.forEach((skill) => {
      this._mentorSkills.set(mentorId.value, [...this._mentorSkills.get(mentorId.value), skill]);
    });
    return ok(skills);
  }

  countSkill() {
    return this._skills.size;
  }

  countMentorSkill(id: MentorId): Result<number, Error> {
    if (this._mentorSkills.has(id.value)) {
      return ok(this._mentorSkills.get(id.value).length);
    }
    return err(new MentorNotFoundException());
  }

  clear() {
    this._skills.clear();
    this._mentorSkills.clear();
  }

  cleanMentorSkills(mentorId: MentorId) {
    this._mentorSkills.set(mentorId.value, []);
    return null;
  }

  upsertSkill(skills: Skill[]) {
    const skillsNames = [...this._skills.values()].map((skill) => skill.name);
    skills.forEach((skill) => {
      if (!this._skills.has(skill.id.value) && !skillsNames.includes(skill.name)) {
        this._skills.set(skill.id.value, skill);
      }
    });

    const skillUpsertNames = skills.map((skill) => skill.name);
    const commonSkills = [...this._skills.values()].filter((skill) => skillUpsertNames.includes(skill.name));
    return ok(commonSkills);
  }
}
