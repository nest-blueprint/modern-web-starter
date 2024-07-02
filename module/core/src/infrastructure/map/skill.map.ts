import { err, ok, Result } from 'neverthrow';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { Skill } from '../../domain/skill';
import { Skill as SkillRaw } from '../type/raw/skill.raw';
import { Skill as SkillEntity } from '../sequelize/entity/skill.entity';
import { Id } from '../../domain/skill/id';
import { RuntimeErrorException } from '../exception/runtime-error.exception';

export class SkillMap {
  name: string;

  @Type(() => Id)
  @Transform(({ value }) => new Id(value))
  skill_id: string;

  static toDomain(skill: SkillRaw): Result<Skill, Error>;
  static toDomain(skill: SkillEntity): Result<Skill, Error>;
  static toDomain(skill: SkillRaw | SkillEntity): Result<Skill, Error> {
    try {
      if (skill instanceof SkillEntity) {
        const mappedSkillData = plainToInstance(SkillMap, skill.dataValues);
        const { skill_id, name } = <never>mappedSkillData || {};

        return ok(new Skill(skill_id, name));
      }

      if (SkillMap.containsAllKeys(skill)) {
        return ok(new Skill(new Id(skill.skill_id), skill.name));
      }
      return err(
        new RuntimeErrorException('Failed to map skill', {
          method: 'SkillMap.toDomain',
          input: skill,
        }),
      );
    } catch (error: any) {
      return err(
        new RuntimeErrorException('Failed to map skill', { error, method: 'SkillMap.toDomain', input: skill }),
      );
    }
  }

  private static containsAllKeys(skill: any): skill is SkillRaw {
    return skill.hasOwnProperty('skill_id') && skill.hasOwnProperty('name');
  }

  static toRaw(skill: Skill): SkillRaw {
    return {
      name: skill.name,
      skill_id: skill.id.value,
    };
  }
  static toJSON(skill: Skill) {
    return SkillMap.toRaw(skill);
  }

  static toEntity(skill: Skill): SkillEntity {
    return plainToInstance(SkillEntity, SkillMap.toRaw(skill));
  }
}
