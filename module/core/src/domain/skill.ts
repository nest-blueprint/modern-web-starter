import { Id } from './skill/id';
import { v4 as uuid } from 'uuid';
import assert from 'assert';

export class Skill {
  static MaxNameLength = 50;
  static MinNameLength = 1;

  private readonly skillName: string;
  constructor(private readonly _skillId: Id, skillName: string) {
    assert(skillName && typeof skillName === 'string', 'Skill name is required');
    assert(this._skillId instanceof Id, 'must be an instance of SkillId');

    const trimmedName = skillName
      .toLowerCase()
      .trim()
      .replace(/\s{2,}/g, ' ');

    assert(!/^[0-9]+$/.test(trimmedName), 'Skill name cannot be only numbers');

    assert(/^[a-z]/.test(trimmedName), 'Skill name must start with a letter');

    assert(trimmedName.length <= Skill.MaxNameLength, `Skill name must be less than ${Skill.MaxNameLength} characters`);
    assert(trimmedName.length >= Skill.MinNameLength, `Skill name must be more than ${Skill.MinNameLength} characters`);

    this.skillName = trimmedName;
  }

  get id() {
    return this._skillId;
  }

  get name() {
    return this.skillName;
  }

  static create(name: string): Skill {
    const id = uuid();
    const skillId = new Id(id);
    return new Skill(skillId, name);
  }
}
