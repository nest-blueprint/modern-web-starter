import { Test } from '@nestjs/testing';
import { SequelizeProvider } from '../../../../src/infrastructure/sequelize/sequelize.provider';
import { Repository, Sequelize } from 'sequelize-typescript';
import { Id as SkillId } from '../../../../src/domain/skill/id';
import { Id as UserId } from '../../../../src/domain/user/id';
import { Id as MentorId } from '../../../../src/domain/mentor/id';
import { SequelizeToken } from '../../../../src/infrastructure/sequelize/token/sequelize.token';
import { ConfigLoaderToken } from '../../../../src/infrastructure/init/token.init';
import { appConfig } from '../../../../../../config/autoload/app.config';
import { ConfigLoaderService } from '../../../../src/infrastructure/init/service/config-loader.service';
import { Skill } from '../../../../src/domain/skill';
import { SkillRepository } from '../../../../src/infrastructure/repository/skill.repository';
import { SkillRepositoryFactory } from '../../../../src/infrastructure/repository/factory/skill.repository.factory';
import { SkillAlreadyExistsException } from '../../../../src/infrastructure/exception/skill-already-exists-exception';
import { Mentor as MentorEntity } from '../../../../src/infrastructure/sequelize/entity/mentor.entity';
import { User as UserEntity } from '../../../../src/infrastructure/sequelize/entity/user.entity';
import { Skill as SkillEntity } from '../../../../src/infrastructure/sequelize/entity/skill.entity';
import { runSequelizeTransaction } from '../../util';
import { SkillNotFoundException } from '../../../../src/infrastructure/exception/skill-not-found.excpetion';
import { Transaction } from 'sequelize';
import { MentorSettings } from '../../../../src/domain/mentor-settings';
import { Type as TrainingType } from '../../../../src/domain/training/type';
import { Type } from '../../../../src/domain/user/type';
import { User } from '../../../../src/domain/user';
import { Email } from '../../../../src/domain/user/email';
import { Availability } from '../../../../src/domain/mentor/availability';
import { Language } from '../../../../src/domain/language';
import { Mentor } from '../../../../src/domain/mentor';
import { Auth0UserId } from '../../../../src/infrastructure/resource/auth0/type/auth0-user-id';
import { randomBetween } from '../../../double/provider/external/auth0/util/auth0.util';
import { UserMap } from '../../../../src/infrastructure/map/user.map';
import { MentorMap } from '../../../../src/infrastructure/map/mentor.map';
import { MentorNotFoundException } from '../../../../src/infrastructure/exception/mentor-not-found.exception';
import { SkillCollectionToken } from '../../../../src/infrastructure/repository/factory/token.factory';
import { SkillMap } from '../../../../src/infrastructure/map/skill.map';
import { MentorSkill as MentorSkillEntity } from '../../../../src/infrastructure/sequelize/entity/mentor-skill.entity';
describe('[Core/Infrastructure] SKill Repository', () => {
  let sequelize: Sequelize;
  let skillRepository: SkillRepository;
  let sequelizeMentorRepository: Repository<MentorEntity>;
  let sequelizeUserRepository: Repository<UserEntity>;
  let sequelizeSkillRepository: Repository<SkillEntity>;
  let sequelizeMentorSkillRepository: Repository<MentorSkillEntity>;

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
        SkillRepositoryFactory,
      ],
    }).compile();

    sequelize = module.get(SequelizeToken);
    skillRepository = module.get(SkillCollectionToken);
    sequelizeMentorRepository = sequelize.getRepository(MentorEntity);
    sequelizeUserRepository = sequelize.getRepository(UserEntity);
    sequelizeSkillRepository = sequelize.getRepository(SkillEntity);
    sequelizeMentorSkillRepository = sequelize.getRepository(MentorSkillEntity);
  });

  it('SequelizeProvider should be defined and instanced', () => {
    expect(sequelize).toBeDefined();
    expect(sequelize).toBeInstanceOf(Sequelize);
  });

  it('Skill Repository can be instanced', () => {
    expect(skillRepository).toBeDefined();
    expect(skillRepository).toBeInstanceOf(SkillRepository);
  });

  it('Sequelize Mentor Repository should be defined and instanced', () => {
    expect(sequelizeMentorRepository).toBeDefined();
  });

  test('add', async () => {
    const skillJavascript = Skill.create('javascript');
    const skillJavascript2 = Skill.create('javascript');

    const addSkill1 = async () => {
      const result = await skillRepository.add(skillJavascript);
      expect(result.isOk()).toBeTruthy();

      const skillResult = result._unsafeUnwrap();
      expect(skillResult).toBeInstanceOf(Skill);
      expect(skillResult.id.value).toEqual(skillJavascript.id.value);
      expect(skillResult.name).toEqual(skillJavascript.name);
    };
    const addSkill2 = async () => {
      const result = await skillRepository.add(skillJavascript2);
      const result2 = await skillRepository.add(skillJavascript2);
      expect(result.isOk()).toBeTruthy();
      expect(result2.isErr()).toBeTruthy();

      const result2Error = result2._unsafeUnwrapErr();
      expect(result2Error).toBeInstanceOf(SkillAlreadyExistsException);
    };

    await expect(runSequelizeTransaction(sequelize, addSkill1)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, addSkill2)).rejects.toThrow('rollback');
  });
  test('delete', async () => {
    const skillJavascript = Skill.create('javascript');

    const deleteSkill1 = async () => {
      const result = await skillRepository.add(skillJavascript);
      expect(result.isOk()).toBeTruthy();

      const skillDeletionResult = await skillRepository.delete(skillJavascript.id);
      expect(skillDeletionResult.isOk()).toBeTruthy();
      expect(skillDeletionResult._unsafeUnwrap()).toBeInstanceOf(Skill);
      expect(skillDeletionResult._unsafeUnwrap().id.value).toEqual(skillJavascript.id.value);
    };
    const deleteSkill2 = async () => {
      const result = await skillRepository.delete(skillJavascript.id);

      expect(result.isErr()).toBeTruthy();

      const error = result._unsafeUnwrapErr();
      expect(error).toBeInstanceOf(SkillNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, deleteSkill1)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, deleteSkill2)).rejects.toThrow('rollback');
  });

  test('get', async () => {
    const skillJavascript = Skill.create('javascript');
    const skillJavascript2 = Skill.create('javascript');

    const getSkill1 = async (transaction: Transaction) => {
      await sequelizeSkillRepository.create(SkillMap.toRaw(skillJavascript), { transaction });

      const skillGetResult = await skillRepository.get(skillJavascript.id);
      expect(skillGetResult.isOk()).toBeTruthy();

      const skill = skillGetResult._unsafeUnwrap();

      expect(skill).toBeInstanceOf(Skill);
      expect(skill.id.value).toEqual(skillJavascript.id.value);
      expect(skill.name).toEqual(skillJavascript.name);
    };
    const getSkill2 = async (transaction: Transaction) => {
      await sequelizeSkillRepository.create(SkillMap.toRaw(skillJavascript2), { transaction });

      const result = await skillRepository.get(skillJavascript.id);
      expect(result.isErr()).toBeTruthy();

      const error = result._unsafeUnwrapErr();
      expect(error).toBeInstanceOf(SkillNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, getSkill1)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, getSkill2)).rejects.toThrow('rollback');
  });

  test('getSkillByName', async () => {
    const skillJavascript = Skill.create('javascript');
    const skillJavascript2 = Skill.create('javascript');

    const getSkillByName1 = async () => {
      const result = await skillRepository.add(skillJavascript);
      expect(result.isOk()).toBeTruthy();

      const skillGetResult = await skillRepository.getSkillByName(skillJavascript);
      expect(skillGetResult.isOk()).toBeTruthy();

      const skill = skillGetResult._unsafeUnwrap();

      expect(skill).toBeInstanceOf(Skill);
      expect(skill.id.value).toEqual(skillJavascript.id.value);
      expect(skill.name).toEqual(skillJavascript.name);
    };
    const getSkillByName2 = async () => {
      const result = await skillRepository.getSkillByName(skillJavascript2);
      expect(result.isErr()).toBeTruthy();

      const error = result._unsafeUnwrapErr();
      expect(error).toBeInstanceOf(SkillNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, getSkillByName1)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, getSkillByName2)).rejects.toThrow('rollback');
  });
  test('update', async () => {
    const skillId = SkillId.create();
    const skillJavascript = new Skill(skillId, 'javascript');
    const skillTypescript = new Skill(skillId, 'typescript');

    const updateSkill1 = async (transaction: Transaction) => {
      await sequelizeSkillRepository.create(SkillMap.toRaw(skillJavascript), { transaction });

      const skillUpdateResult = await skillRepository.update(skillTypescript);
      expect(skillUpdateResult.isOk()).toBeTruthy();

      const skill = skillUpdateResult._unsafeUnwrap();

      expect(skill).toBeInstanceOf(Skill);
      expect(skill.id.value).toEqual(skillId.value);
      expect(skill.name).toEqual(skillTypescript.name);
    };

    const updateSkill2 = async () => {
      const result = await skillRepository.update(skillTypescript);
      expect(result.isErr()).toBeTruthy();

      const error = result._unsafeUnwrapErr();
      expect(error).toBeInstanceOf(SkillNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, updateSkill1)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, updateSkill2)).rejects.toThrow('rollback');
  });
  test('getFromMentor', async () => {
    const mentorId = MentorId.create();

    // Settings
    const mentorSettings = new MentorSettings(mentorId, true, true, true, true, true, true, true);

    // User
    const userType = Type.fromString('mentor');
    const user = User.create(UserId.create(), Email.fromString('john.doe@example.com'), userType);

    // Skills
    const skills = [Skill.create('java'), Skill.create('javascript'), Skill.create('typescript')];

    // Mentor
    const availability = Availability.fromString('full_time');
    const languages = [Language.fromString('fr'), Language.fromString('en')];
    const trainingTypes = [TrainingType.fromString('remote'), TrainingType.fromString('face_to_face')];
    const mentor = new Mentor(
      mentorId,
      user,
      'Profile description',
      availability,
      languages,
      trainingTypes,
      mentorSettings,
      skills,
      [],
      [],
      'Developer',
      'J.Doe',
    );

    const auth0UserId = new Auth0UserId(`auth0|${randomBetween(100000000, 999999999)}`);

    const getFromMentor1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: auth0UserId.value };
      //@ts-expect-error avoid typing errors
      await sequelizeUserRepository.create(userJson, { transaction });
      const mentorEntity = MentorMap.toEntity(mentor, auth0UserId);
      await mentorEntity.save({ transaction });

      const skillPromises = skills.map(async (skill) => {
        const result = await skillRepository.add(skill);
        return result._unsafeUnwrap();
      });

      const skillsAddedToDatabase = await Promise.all(skillPromises);

      const setMentorSkillsResult = await skillRepository.setMentorSkills(mentorId, skillsAddedToDatabase);

      expect(setMentorSkillsResult.isOk()).toBeTruthy();

      const mentorSkillsResult = await skillRepository.getFromMentor(mentorId);
      expect(mentorSkillsResult.isOk()).toBeTruthy();

      const mentorSkills = mentorSkillsResult._unsafeUnwrap();
      expect(mentorSkills).toBeInstanceOf(Array);
      expect(mentorSkills.length).toEqual(skills.length);
    };

    const getFromMentor2 = async () => {
      const mentorSkillsResult = await skillRepository.getFromMentor(mentorId);
      expect(mentorSkillsResult.isErr()).toBeTruthy();
      expect(mentorSkillsResult._unsafeUnwrapErr()).toBeInstanceOf(MentorNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, getFromMentor1)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, getFromMentor2)).rejects.toThrow('rollback');
  });

  test('updateMentorSkills', async () => {
    const mentorId = MentorId.create();

    // Settings
    const mentorSettings = new MentorSettings(mentorId, true, true, true, true, true, true, true);

    // User
    const userType = Type.fromString('mentor');
    const user = User.create(UserId.create(), Email.fromString('john.doe@example.com'), userType);

    // Skills
    const skills = [Skill.create('java'), Skill.create('javascript'), Skill.create('typescript')];

    // Mentor
    const availability = Availability.fromString('full_time');
    const languages = [Language.fromString('fr'), Language.fromString('en')];
    const trainingTypes = [TrainingType.fromString('remote'), TrainingType.fromString('face_to_face')];
    const mentor = new Mentor(
      mentorId,
      user,
      'Profile description',
      availability,
      languages,
      trainingTypes,
      mentorSettings,
      skills,
      [],
      [],
      'Developer',
      'J.Doe',
    );

    const auth0UserId = new Auth0UserId(`auth0|${randomBetween(100000000, 999999999)}`);

    const setMentorSkills1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: auth0UserId.value };
      //@ts-expect-error avoid typing errors
      await sequelizeUserRepository.create(userJson, { transaction });

      const mentorEntity = MentorMap.toEntity(mentor, auth0UserId);

      const skillPromises = skills.map(async (skill) => {
        const result = await skillRepository.add(skill);
        return result._unsafeUnwrap();
      });

      const skillsAddedToDatabase = await Promise.all(skillPromises);

      await mentorEntity.save({ transaction });

      const setMentorSkillsResult = await skillRepository.setMentorSkills(mentorId, skillsAddedToDatabase);

      expect(setMentorSkillsResult.isOk()).toBeTruthy();

      const newSkills = [Skill.create('python')];
      await sequelizeSkillRepository.create(SkillMap.toRaw(newSkills[0]), { transaction });

      const mentorSkillsResult = await skillRepository.setMentorSkills(mentorId, newSkills);

      expect(mentorSkillsResult.isOk()).toBeTruthy();

      const mentorSkills = mentorSkillsResult._unsafeUnwrap();

      expect(mentorSkills.map((skill) => skill.id).length === 4).toBeTruthy();
      expect(
        mentorSkills
          .map((skill) => skill.name)
          .every((name) => ['java', 'python', 'typescript', 'javascript'].includes(name)),
      ).toBeTruthy();
    };

    const setMentorSkills2 = async () => {
      const newSkills = [Skill.create('python')];

      const mentorSkillsResult = await skillRepository.setMentorSkills(mentorId, newSkills);
      expect(mentorSkillsResult.isErr()).toBeTruthy();
      expect(mentorSkillsResult._unsafeUnwrapErr()).toBeInstanceOf(MentorNotFoundException);
    };

    const setMentorSkills3 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: auth0UserId.value };
      //@ts-expect-error avoid typing errors
      await sequelizeUserRepository.create(userJson, { transaction });

      const mentorEntity = MentorMap.toEntity(mentor, auth0UserId);

      await mentorEntity.save({ transaction });

      const newSkills = [Skill.create('rust'), Skill.create('yew')];

      const mentorSkillsResult = await skillRepository.setMentorSkills(mentorId, newSkills);

      expect(mentorSkillsResult.isErr()).toBeTruthy();

      const error = mentorSkillsResult._unsafeUnwrapErr();

      expect(error).toBeInstanceOf(SkillNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, setMentorSkills1)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, setMentorSkills2)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, setMentorSkills3)).rejects.toThrow('rollback');
  });
  test('cleanMentorSkills', async () => {
    const mentorId = MentorId.create();

    // Settings
    const mentorSettings = new MentorSettings(mentorId, true, true, true, true, true, true, true);

    // User
    const userType = Type.fromString('mentor');
    const user = User.create(UserId.create(), Email.fromString('john.doe@example.com'), userType);

    // Skills
    const skills = [Skill.create('java'), Skill.create('javascript'), Skill.create('typescript')];

    // Mentor
    const availability = Availability.fromString('full_time');
    const languages = [Language.fromString('fr'), Language.fromString('en')];
    const trainingTypes = [TrainingType.fromString('remote'), TrainingType.fromString('face_to_face')];
    const mentor = new Mentor(
      mentorId,
      user,
      'Profile description',
      availability,
      languages,
      trainingTypes,
      mentorSettings,
      skills,
      [],
      [],
      'Developer',
      'J.Doe',
    );

    const auth0UserId = new Auth0UserId(`auth0|${randomBetween(100000000, 999999999)}`);

    const cleanMentorSkills1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: auth0UserId.value };
      //@ts-expect-error avoid typing errors
      await sequelizeUserRepository.create(userJson, { transaction });

      const mentorEntity = MentorMap.toEntity(mentor, auth0UserId);

      await mentorEntity.save({ transaction });

      const mentorSkillsResult = await skillRepository.cleanMentorSkills(mentorId);
      expect(mentorSkillsResult.isOk()).toBeTruthy();

      const mentorSkillsResultAfterCleaning = await skillRepository.getFromMentor(mentorId);
      expect(mentorSkillsResultAfterCleaning.isErr()).toBeTruthy();

      const error = mentorSkillsResultAfterCleaning._unsafeUnwrapErr();
      expect(error).toBeInstanceOf(SkillNotFoundException);
    };

    const cleanMentorSkills2 = async () => {
      const mentorSkillsResult = await skillRepository.cleanMentorSkills(mentorId);
      expect(mentorSkillsResult.isErr()).toBeTruthy();
      expect(mentorSkillsResult._unsafeUnwrapErr()).toBeInstanceOf(MentorNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, cleanMentorSkills1)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, cleanMentorSkills2)).rejects.toThrow('rollback');
  });

  test('upsertSkill', async () => {
    const skills = [Skill.create('java'), Skill.create('javascript'), Skill.create('typescript')];

    const upsertSkill1 = async () => {
      const skillUpsertResult = await skillRepository.upsertSkill(skills);
      expect(skillUpsertResult.isOk()).toBeTruthy();

      const skillAddedResult = skillUpsertResult._unsafeUnwrap();
      expect(skillAddedResult.length === 3).toBeTruthy();
      expect(skillAddedResult.map((skill) => skill.name)).toEqual(['java', 'javascript', 'typescript']);
    };

    await expect(runSequelizeTransaction(sequelize, upsertSkill1)).rejects.toThrow('rollback');
  });
});
