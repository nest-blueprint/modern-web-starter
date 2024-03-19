import { Id as SkillId } from '../../../src/domain/skill/id';
import { Uuid } from '../../../src/infrastructure/type/uuid.type';
import { Skill } from '../../../src/domain/skill';

describe('[Core/Domain] Skill', () => {
  test('should create a skill', () => {
    const skill = new Skill(new SkillId(Uuid.random()), 'php');
    const skill2 = new Skill(new SkillId(Uuid.random()), 'Adobe XD');
    const skill3 = new Skill(new SkillId(Uuid.random()), 'skill-1');
    const skill4 = new Skill(new SkillId(Uuid.random()), 'skill 1');
    expect(skill).toBeInstanceOf(Skill);
  });

  test('skill name should be trimmed and lowercased', () => {
    const skill = new Skill(new SkillId(Uuid.random()), ' PHP ');
    expect(skill.name).toBe('php');

    const skill2 = new Skill(new SkillId(Uuid.random()), 'PHP');
    expect(skill2.name).toBe('php');
  });

  test('instantiation should fail with every invalid argument provided', () => {
    expect(() => new Skill(null, 'bar')).toThrow();
    expect(() => new Skill(new SkillId(Uuid.random()), null)).toThrow();
    expect(() => new Skill(new SkillId(Uuid.random()), '1223')).toThrow();
    expect(() => new Skill(new SkillId(Uuid.random()), '$Javascript')).toThrow();
  });
});
