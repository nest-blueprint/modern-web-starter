import { Id as SkillId } from '../../../../src/domain/skill/id';
import { SkillMap } from '../../../../src/infrastructure/map/skill.map';
import { Sequelize } from 'sequelize-typescript';
import { Test } from '@nestjs/testing';
import { ConfigLoaderToken } from '../../../../src/infrastructure/init/token.init';
import { appConfig } from '../../../../../../config/autoload/app.config';
import { ConfigLoaderService } from '../../../../src/infrastructure/init/service/config-loader.service';
import { SequelizeProvider } from '../../../../src/infrastructure/sequelize/sequelize.provider';
import { SequelizeToken } from '../../../../src/infrastructure/sequelize/token/sequelize.token';
import { Skill as SkillEntity } from '../../../../../core/src/infrastructure/sequelize/entity/skill.entity';
import { Skill } from '../../../../src/domain/skill';
import { Skill as SkillRaw } from '../../../../src/infrastructure/type/raw/skill.raw';
import { Transaction } from 'sequelize';
import { runSequelizeTransaction } from '../../util';
describe('[Core/Infrastructure] SkillMap', () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        {
          provide: ConfigLoaderToken,
          useFactory: () => {
            const config = appConfig();
            return new ConfigLoaderService(config);
          },
        },
        SequelizeProvider,
      ],
    }).compile();
    sequelize = module.get(SequelizeToken);
  });

  it('Sequelize should be defined', () => {
    expect(sequelize).toBeDefined();
    expect(sequelize).toBeInstanceOf(Sequelize);
  });

  test('SkillMap.toEntity', async () => {
    // Safest way to test if SkillMap.toEntity is working is to create a skill in the database using it.

    const skill = Skill.create('javascript');
    const skillEntity = SkillMap.toEntity(skill);

    const createSkillUsingEntity = async (transaction: Transaction) => {
      await skillEntity.save({ transaction });
      const skillRaw = await SkillEntity.findByPk(skill.id.value, { transaction });
      expect(skillRaw).toBeDefined();

      const skillRawData = skillRaw.get({ plain: true });
      expect(skillRawData).toBeDefined();
      expect(skillRawData).toHaveProperty('skill_id');
      expect(skillRawData).toHaveProperty('name');
      expect(skillRawData.skill_id).toBe(skill.id.value);
      expect(skillRawData.name).toBe(skill.name);
    };

    await expect(runSequelizeTransaction(sequelize, createSkillUsingEntity)).rejects.toThrow('rollback');
  });

  test('SkillMap.toDomain', () => {
    const skillRepository = sequelize.getRepository(SkillEntity);

    // SkillMap.toDomain(skill: SkillEntity): Result<Skill, Error>
    const skill = skillRepository.build({
      skill_id: SkillId.random(),
      name: 'javascript',
    });

    const mappedSkillResult = SkillMap.toDomain(skill);
    const mappedSkill = mappedSkillResult._unsafeUnwrap();
    expect(mappedSkillResult.isOk()).toBeTruthy();
    expect(mappedSkill.id).toBeInstanceOf(SkillId);
    expect(typeof skill.name === 'string').toBeTruthy();
    expect(mappedSkill.name).toEqual(skill.name);

    // SkillMap.toDomain(skill: SkillRaw): Result<Skill, Error>
    const skillRaw: SkillRaw = {
      skill_id: SkillId.random(),
      name: 'javascript',
    };

    const mappedSkillRawResult = SkillMap.toDomain(skillRaw);
    const mappedSkillRaw = mappedSkillRawResult._unsafeUnwrap();
    expect(mappedSkillRawResult.isOk()).toBeTruthy();
    expect(mappedSkillRaw.id).toBeInstanceOf(SkillId);
    expect(typeof skillRaw.name === 'string').toBeTruthy();
  });

  test('Skill.toRawObject', () => {
    const skill = Skill.create('javascript');
    const mappedSkillRaw = SkillMap.toRaw(skill);
    expect(mappedSkillRaw.skill_id).toEqual(skill.id.value);
    expect(typeof skill.name === 'string').toBeTruthy();
    expect(mappedSkillRaw.name).toEqual(skill.name);
  });
});
