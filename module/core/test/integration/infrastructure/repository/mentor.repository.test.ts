import { Test } from '@nestjs/testing';
import { MentorRepositoryFactory } from '../../../../src/infrastructure/repository/factory/mentor.repository.factory';
import { MentorRepository } from '../../../../src/infrastructure/repository/mentor.repository';
import { User } from '../../../../src/domain/user';
import { SequelizeProvider } from '../../../../src/infrastructure/sequelize/sequelize.provider';
import { Repository, Sequelize } from 'sequelize-typescript';
import {
  MentorCollectionToken,
  PersonCollectionToken,
  PricingPlanCollectionToken,
  SkillCollectionToken,
  UserCollectionToken,
} from '../../../../src/infrastructure/repository/factory/token.factory';
import { SequelizeToken } from '../../../../src/infrastructure/sequelize/token/sequelize.token';
import { Mentor } from '../../../../src/domain/mentor';
import { User as UserEntity } from '../../../../src/infrastructure/sequelize/entity/user.entity';
import { Id as MentorId } from '../../../../src/domain/mentor/id';
import { Id as UserId } from '../../../../src/domain/user/id';
import { Email } from '../../../../src/domain/user/email';
import { Availability } from '../../../../src/domain/mentor/availability';
import { Language } from '../../../../src/domain/language';
import { Type as TrainingType } from '../../../../src/domain/training/type';
import { MentorSettings } from '../../../../src/domain/mentor-settings';
import { UserRepository } from '../../../../src/infrastructure/repository/user.repository';
import { PersonRepository } from '../../../../src/infrastructure/repository/person.repository';
import { Person as PersonEntity } from '../../../../src/infrastructure/sequelize/entity/person.entity';
import { Id as PersonId } from '../../../../src/domain/person/id';
import { Person } from '../../../../src/domain/person';
import { UserMap } from '../../../../src/infrastructure/map/user.map';
import { PersonMap } from '../../../../src/infrastructure/map/person.map';
import { MentorAlreadyExistsException } from '../../../../src/infrastructure/exception/mentor-already-exists.exception';
import { MentorNotFoundException } from '../../../../src/infrastructure/exception/mentor-not-found.exception';
import { ConfigLoaderToken } from '../../../../src/infrastructure/init/token.init';
import { appConfig } from '../../../../../../config/autoload/app.config';
import { ConfigLoaderService } from '../../../../src/infrastructure/init/service/config-loader.service';
import { Transaction } from 'sequelize';
import { Id as SkillId } from '../../../../src/domain/skill/id';
import { Skill } from '../../../../src/domain/skill';
import { PhoneNumber } from '../../../../src/domain/person/phone-number';
import { Id as PricingPlanId } from '../../../../src/domain/pricing-plan/id';
import { Money } from '../../../../src/domain/money';
import { Type as PricingType } from '../../../../src/domain/pricing/type';
import { PricingPlan } from '../../../../src/domain/pricing-plan';
import { SkillRepository } from '../../../../src/infrastructure/repository/skill.repository';
import { PricingPlanRepository } from '../../../../src/infrastructure/repository/pricing-plan.repository';
import { SkillRepositoryFactory } from '../../../../src/infrastructure/repository/factory/skill.repository.factory';
import { PricingPlanRepositoryFactory } from '../../../../src/infrastructure/repository/factory/pricing-plan.repository.factory';
import { support } from './mentor.repository.support';
import { PersonRepositoryFactory } from '../../../../src/infrastructure/repository/factory/person.repository.factory';
import { UserRepositoryFactory } from '../../../../src/infrastructure/repository/factory/user.repository.factory';
import { runSequelizeTransaction } from '../../util';
import { OrderBy } from '../../../../src/domain/order-by';
import { Type } from '../../../../src/domain/user/type';
import { Auth0UserId } from '../../../../src/infrastructure/resource/auth0/type/auth0-user-id';
import { randomBetween } from '../../../double/provider/external/auth0/util/auth0.util';

describe('[Core/Infrastructure] MentorRepository', () => {
  let sequelize: Sequelize;

  let mentorRepository: MentorRepository;
  let skillRepository: SkillRepository;
  let personRepository: PersonRepository;
  let userRepository: UserRepository;
  let pricingPlanRepository: PricingPlanRepository;

  let sequelizePersonRepository: Repository<PersonEntity>;
  let sequelizeUserRepository: Repository<UserEntity>;

  afterEach(async () => {
    await sequelize.close();
  });

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
        MentorRepositoryFactory,
        SkillRepositoryFactory,
        PersonRepositoryFactory,
        PricingPlanRepositoryFactory,
        UserRepositoryFactory,
        SequelizeProvider,
      ],
    }).compile();

    mentorRepository = module.get(MentorCollectionToken);
    skillRepository = module.get(SkillCollectionToken);
    pricingPlanRepository = module.get(PricingPlanCollectionToken);
    personRepository = module.get(PersonCollectionToken);
    userRepository = module.get(UserCollectionToken);

    sequelize = module.get(SequelizeToken);

    sequelizeUserRepository = sequelize.getRepository(UserEntity);
    sequelizePersonRepository = sequelize.getRepository(PersonEntity);
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it('MentorRepository should be defined and instanced', () => {
    expect(mentorRepository).toBeDefined();
    expect(mentorRepository).toBeInstanceOf(MentorRepository);
  }, 3000);

  it('UserRepository should be defined and instanced', () => {
    expect(userRepository).toBeDefined();
    expect(userRepository).toBeInstanceOf(UserRepository);
  }, 3000);

  it('PersonRepository should be defined and instanced', () => {
    expect(personRepository).toBeDefined();
    expect(personRepository).toBeInstanceOf(PersonRepository);
  }, 3000);

  it('SkillRepository should be defined and instanced', () => {
    expect(skillRepository).toBeDefined();
    expect(skillRepository).toBeInstanceOf(SkillRepository);
  });

  it('PricingPlanRepository should be defined and instanced', () => {
    expect(pricingPlanRepository).toBeDefined();
    expect(pricingPlanRepository).toBeInstanceOf(PricingPlanRepository);
  });

  it('Sequelize should be defined and instanced', () => {
    expect(sequelize).toBeDefined();
    expect(sequelize).toBeInstanceOf(Sequelize);
  }, 3000);

  it('UserRepository should be defined and instanced', () => {
    expect(userRepository).toBeDefined();
    expect(userRepository).toBeInstanceOf(UserRepository);
  });

  test('get', async () => {
    // Create user
    const userId = UserId.create();
    const email = new Email('john.doe@example.com');
    const userType = Type.fromString('mentor');
    const auth0UserId = new Auth0UserId('auth0|0123456789');

    const user = await new User(userId, email, userType);

    // Create person
    const personId = PersonId.create();
    const person = new Person(personId, userId, 'John', 'Doe', null, null, null, null, null);

    // Create mentor

    const mentorId = MentorId.create();
    const description = "I'm a mentor";
    const availability = Availability.fromString(Availability.ExtraTime);
    const languages = [Language.fromString(Language.French), new Language(Language.English)];
    const trainingTypes = [
      TrainingType.fromString(TrainingType.Remote),
      TrainingType.fromString(TrainingType.FaceToFace),
    ];

    const mentorSettings = new MentorSettings(mentorId, true, true, true, true, true, true, true);

    const mentor = new Mentor(
      mentorId,
      user,
      description,
      availability,
      languages,
      trainingTypes,
      mentorSettings,
      [],
      [],
      [],
      'Developer',
      'Developer',
    );

    // Case when the mentor exists
    const getMentorTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: auth0UserId.value };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });
      const mentorAddResult = await mentorRepository.add(mentor);
      expect(mentorAddResult.isOk()).toBeTruthy();

      const getMentorResult = await mentorRepository.get(mentorId);

      expect(getMentorResult.isOk()).toBeTruthy();

      expect(getMentorResult._unsafeUnwrap().id.value).toEqual(mentor.id.value);
    };

    // Case when the mentor does not exist
    const getMentorTest2 = async () => {
      const getMentorResult = await mentorRepository.get(mentorId);

      expect(getMentorResult.isErr()).toBeTruthy();
      expect(getMentorResult._unsafeUnwrapErr()).toBeInstanceOf(MentorNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, getMentorTest1)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, getMentorTest2)).rejects.toThrow('rollback');
  }, 10000);

  test('add', async () => {
    // Create user
    const userId = UserId.create();
    const email = new Email('john2.doe@example.com');
    const userType = Type.fromString('mentor');

    const user = await new User(userId, email, userType);

    const auth0UserId = new Auth0UserId('auth0|0123456789');
    // Create person
    const personId = PersonId.create();
    const person = new Person(personId, userId, 'John', 'Doe', null, null, null, null, null);

    // Create mentor
    const mentorId = MentorId.create();
    const description = "I'm a mentor";
    const availability = Availability.fromString(Availability.ExtraTime);
    const languages = [Language.fromString(Language.French), new Language(Language.English)];
    const trainingTypes = [
      TrainingType.fromString(TrainingType.Remote),
      TrainingType.fromString(TrainingType.FaceToFace),
    ];

    const mentorSettings = new MentorSettings(mentorId, true, true, true, true, true, true, true);

    const mentor = new Mentor(
      mentorId,
      user,
      description,
      availability,
      languages,
      trainingTypes,
      mentorSettings,
      [],
      [],
      [],
      'Developer',
      'Developer',
    );

    // Case when the mentor is successfully added
    const createMentorTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: auth0UserId.value };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });
      const mentorAddResult = await mentorRepository.add(mentor);
      expect(mentorAddResult.isOk()).toBeTruthy();
      expect(mentorAddResult._unsafeUnwrap()).toBeInstanceOf(Mentor);
      expect(mentorAddResult._unsafeUnwrap().id.value).toEqual(mentorId.value);
      expect(mentorAddResult._unsafeUnwrap().user.id.value).toEqual(userId.value);
      expect(mentorAddResult._unsafeUnwrap().profileDescription).toEqual(description);
      expect(mentorAddResult._unsafeUnwrap().availability.value).toEqual(availability.value);
    };

    // Case when the mentor is not added because the user does not exist
    const createMentorTest2 = async () => {
      const addMentorResult = await mentorRepository.add(mentor);
      expect(addMentorResult.isErr()).toBeTruthy();
    };

    // Case when the mentor cant be added because it already exists
    const createMentorTest3 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });
      const mentorAddResult = await mentorRepository.add(mentor);

      expect(mentorAddResult.isOk()).toBeTruthy();
      expect(mentorAddResult._unsafeUnwrap()).toBeInstanceOf(Mentor);

      const mentorAddResult2 = await mentorRepository.add(mentor);

      expect(mentorAddResult2.isErr()).toBeTruthy();
      expect(mentorAddResult2._unsafeUnwrapErr()).toBeInstanceOf(MentorAlreadyExistsException);
    };

    await expect(runSequelizeTransaction(sequelize, createMentorTest1)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, createMentorTest2)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, createMentorTest3)).rejects.toThrow('rollback');
  }, 10000);

  test('delete', async () => {
    // Create user
    const userId = UserId.create();
    const email = new Email('john.doe@example.com');
    const userType = Type.fromString('mentor');

    const user = await new User(userId, email, userType);

    // Create person
    const personId = PersonId.create();
    const person = new Person(personId, userId, 'John', 'Doe', null, null, null, null, null);

    // Create mentor

    const mentorId = MentorId.create();
    const description = "I'm a mentor";
    const availability = Availability.fromString(Availability.ExtraTime);
    const languages = [Language.fromString(Language.French), new Language(Language.English)];
    const trainingTypes = [
      TrainingType.fromString(TrainingType.Remote),
      TrainingType.fromString(TrainingType.FaceToFace),
    ];

    const mentorSettings = new MentorSettings(mentorId, true, true, true, true, true, true, true);

    const mentor = new Mentor(
      mentorId,
      user,
      description,
      availability,
      languages,
      trainingTypes,
      mentorSettings,
      [],
      [],
      [],
      'Developer',
      'Developer',
    );

    // Case when the mentor is successfully deleted
    const deleteTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });
      const mentorAddResult = await mentorRepository.add(mentor);

      expect(mentorAddResult.isOk()).toBeTruthy();
      expect(mentorAddResult._unsafeUnwrap()).toBeInstanceOf(Mentor);

      const deleteMentorResult = await mentorRepository.delete(mentorId);
      expect(deleteMentorResult.isOk()).toBeTruthy();
      expect(deleteMentorResult._unsafeUnwrap()).toBeInstanceOf(Mentor);
    };

    // Case when the mentor is not deleted because it does not exist
    const deleteTest2 = async () => {
      const deleteMentorResult = await mentorRepository.delete(mentorId);
      expect(deleteMentorResult.isErr()).toBeTruthy();
      expect(deleteMentorResult._unsafeUnwrapErr()).toBeInstanceOf(MentorNotFoundException);
      throw new Error('rollback');
    };

    await expect(runSequelizeTransaction(sequelize, deleteTest1)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, deleteTest2)).rejects.toThrow('rollback');
  }, 10000);

  test('getByIds', async () => {
    // Create users
    const userId = UserId.create();
    const email = new Email('john.doe@example.com');
    const userType = Type.fromString('mentor');

    const userId2 = UserId.create();
    const email2 = new Email('bob2.smith@example.com');
    const userType2 = Type.fromString('mentor');

    const user = await new User(userId, email, userType);

    const user2 = await new User(userId2, email2, userType2);

    // Create person
    const personId = PersonId.create();
    const person = new Person(personId, userId, 'John', 'Doe', null, null, null, null, null);

    const personId2 = PersonId.create();
    const person2 = new Person(personId2, userId2, 'Bob', 'Smith', null, null, null, null, null);

    // Create mentor

    const mentorId = MentorId.create();
    const description = "I'm a mentor";
    const availability = Availability.fromString(Availability.ExtraTime);
    const languages = [Language.fromString(Language.French), new Language(Language.English)];
    const trainingTypes = [
      TrainingType.fromString(TrainingType.Remote),
      TrainingType.fromString(TrainingType.FaceToFace),
    ];

    const mentorId2 = MentorId.create();
    const availability2 = Availability.fromString(Availability.FullTime);

    const mentorSettings = new MentorSettings(mentorId, true, true, true, true, true, true, true);
    const mentorSettings2 = new MentorSettings(mentorId2, true, true, true, true, true, true, true);

    const mentor = new Mentor(
      mentorId,
      user,
      description,
      availability,
      languages,
      trainingTypes,
      mentorSettings,
      [],
      [],
      [],
      'Developer',
      'Developer',
    );

    const mentor2 = new Mentor(
      mentorId2,
      user2,
      description,
      availability2,
      languages,
      trainingTypes,
      mentorSettings2,
      [],
      [],
      [],
      'Developer',
      'Developer',
    );

    // Case when the mentors are successfully retrieved
    const getByIdsTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|01234556789' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      const userJson2 = { ...UserMap.toJSON(user2), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson2, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });
      await sequelizePersonRepository.create(PersonMap.toJSON(person2), { transaction });

      const mentorAddResult = await mentorRepository.add(mentor);
      const mentorAddResult2 = await mentorRepository.add(mentor2);

      expect(mentorAddResult.isOk()).toBeTruthy();
      expect(mentorAddResult2.isOk()).toBeTruthy();

      const getByIdsResult = await mentorRepository.getByIds([mentorId, mentorId2]);
      expect(getByIdsResult.isOk()).toBeTruthy();
      expect(getByIdsResult._unsafeUnwrap().length).toBe(2);
      expect(getByIdsResult._unsafeUnwrap()[0]).toBeInstanceOf(Mentor);
      expect(getByIdsResult._unsafeUnwrap()[1]).toBeInstanceOf(Mentor);
    };

    // Case when the mentors are not retrieved because one of them (id provided) does not exist
    const getByIdsTest2 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|01234556789' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      const mentorAddResult = await mentorRepository.add(mentor);

      expect(mentorAddResult.isOk()).toBeTruthy();

      const getByIdsResult = await mentorRepository.getByIds([mentorId, mentorId2]);
      expect(getByIdsResult.isErr()).toBeTruthy();
      expect(getByIdsResult._unsafeUnwrapErr()).toBeInstanceOf(MentorNotFoundException);
    };

    // Case when only one mentor should be retrieved
    const getByIdsTest3 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|01234556789' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      const userJson2 = { ...UserMap.toJSON(user2), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson2, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });
      await sequelizePersonRepository.create(PersonMap.toJSON(person2), { transaction });

      const mentorAddResult = await mentorRepository.add(mentor);
      const mentorAddResult2 = await mentorRepository.add(mentor2);

      expect(mentorAddResult.isOk()).toBeTruthy();
      expect(mentorAddResult2.isOk()).toBeTruthy();

      const getByIdsResult = await mentorRepository.getByIds([mentorId]);
      expect(getByIdsResult.isOk()).toBeTruthy();
      expect(getByIdsResult._unsafeUnwrap().length).toBe(1);
      expect(getByIdsResult._unsafeUnwrap()[0]).toBeInstanceOf(Mentor);
    };

    // Case when the mentors are not retrieved because the mentor provided id  corresponds to any mentor
    const getByIdsTest4 = async () => {
      const mentorId = MentorId.create();
      const getByIdsResult = await mentorRepository.getByIds([mentorId]);
      expect(getByIdsResult.isErr()).toBeTruthy();
      expect(getByIdsResult._unsafeUnwrapErr()).toBeInstanceOf(MentorNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, getByIdsTest1)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, getByIdsTest2)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, getByIdsTest3)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, getByIdsTest4)).rejects.toThrow('rollback');
  }, 10000);

  test('update', async () => {
    // Create user
    const userId = UserId.create();
    const email = new Email('john.doe@example.com');
    const userType = Type.fromString('mentor');

    const user = await new User(userId, email, userType);

    // Create person
    const personId = PersonId.create();
    const person = new Person(personId, userId, 'John', 'Doe', null, null, null, null, null);

    // Create mentor

    const mentorId = MentorId.create();
    const description = "I'm a mentor";
    const availability = Availability.fromString(Availability.ExtraTime);
    const languages = [Language.fromString(Language.French), new Language(Language.English)];
    const trainingTypes = [
      TrainingType.fromString(TrainingType.Remote),
      TrainingType.fromString(TrainingType.FaceToFace),
    ];

    const description2 = "I'm a super mentor !";

    const mentorSettings = new MentorSettings(mentorId, true, true, true, true, true, true, true);

    const mentor = new Mentor(
      mentorId,
      user,
      description,
      availability,
      languages,
      trainingTypes,
      mentorSettings,
      [],
      [],
      [],
      'Developer',
      'Developer',
    );

    const mentorUpdated = new Mentor(
      mentorId,
      user,
      description2,
      availability,
      languages,
      trainingTypes,
      mentorSettings,
      [],
      [],
      [],
      'Developer',
      'Developer',
    );

    // Case when the mentor is updated successfully
    const updateTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });
      const mentorAddedResult = await mentorRepository.add(mentor);
      expect(mentorAddedResult.isOk()).toBeTruthy();

      const updateResult = await mentorRepository.update(mentorUpdated);
      expect(updateResult.isOk()).toBeTruthy();
      expect(updateResult._unsafeUnwrap()).toBeInstanceOf(Mentor);
      expect(updateResult._unsafeUnwrap().profileDescription).toBe(description2);
    };

    // Case when the mentor is not updated because the mentor provided id  corresponds to any mentor
    const updateTest2 = async () => {
      const mentorUpdateResult = await mentorRepository.update(mentor);
      expect(mentorUpdateResult.isErr()).toBeTruthy();
      expect(mentorUpdateResult._unsafeUnwrapErr()).toBeInstanceOf(MentorNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, updateTest1)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, updateTest2)).rejects.toThrow('rollback');
  }, 10000);

  test('findAll', async () => {
    // Create user
    const userId = UserId.create();
    const userId2 = UserId.create();

    const email = new Email('john.doe@example.com');
    const email2 = new Email('john.smith@example.com');

    const userType = Type.fromString('mentor');

    const userType2 = Type.fromString('mentor');

    const user = await new User(userId, email, userType);
    const user2 = await new User(userId2, email2, userType2);

    // Create person
    const personId = PersonId.create();
    const person = new Person(personId, userId, 'John', 'Doe', null, null, null, null, null);

    const personId2 = PersonId.create();
    const person2 = new Person(personId2, userId2, 'John', 'Smith', null, null, null, null, null);

    // Create mentor

    const mentorId = MentorId.create();
    const mentorId2 = MentorId.create();
    const description = "I'm a mentor";
    const availability = Availability.fromString(Availability.ExtraTime);
    const languages = [Language.fromString(Language.French), new Language(Language.English)];
    const trainingTypes = [
      TrainingType.fromString(TrainingType.Remote),
      TrainingType.fromString(TrainingType.FaceToFace),
    ];

    const mentorSettings = new MentorSettings(mentorId, true, true, true, true, true, true, true);
    const mentorSettings2 = new MentorSettings(mentorId2, true, true, true, true, true, true, true);

    const mentor = new Mentor(
      mentorId,
      user,
      description,
      availability,
      languages,
      trainingTypes,
      mentorSettings,
      [],
      [],
      [],
      'Developer',
      'Developer',
    );

    const mentor2 = new Mentor(
      mentorId2,
      user2,
      description,
      availability,
      languages,
      trainingTypes,
      mentorSettings2,
      [],
      [],
      [],
      'Developer',
      'Developer',
    );

    // Case when the mentors are found successfully
    const findAllTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      const userJson2 = { ...UserMap.toJSON(user2), auth0_id: 'auth0|1754738429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson2, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });
      await sequelizePersonRepository.create(PersonMap.toJSON(person2), { transaction });

      await mentorRepository.add(mentor);
      await mentorRepository.add(mentor2);

      const findAllResult = await mentorRepository.findAll();
      expect(findAllResult.isOk()).toBeTruthy();
      expect(findAllResult._unsafeUnwrap().length).toBe(2);
      expect(findAllResult._unsafeUnwrap()[0]).toBeInstanceOf(MentorId);
      expect(findAllResult._unsafeUnwrap()[1]).toBeInstanceOf(MentorId);
    };

    // Case when the mentors are not found because there is no mentor in the database
    const findAllTest2 = async () => {
      const findAllResult = await mentorRepository.findAll();

      expect(findAllResult.isOk()).toBeTruthy();
      expect(findAllResult._unsafeUnwrap()).toBeInstanceOf(Array);
      expect(findAllResult._unsafeUnwrap().length).toBe(0);
    };

    await expect(runSequelizeTransaction(sequelize, findAllTest1)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, findAllTest2)).rejects.toThrow('rollback');
  }, 10000);

  test('findByCriteria', async () => {
    const insertData = async () => {
      const users: User[] = [];
      const skills: Skill[] = [];
      const mentors: Mentor[] = [];
      const pricingPlans: PricingPlan[] = [];

      for (const skill of support.data.skills) {
        const skillId = new SkillId(skill.skill_id);
        const skillDomainObject = new Skill(skillId, skill.name);
        const result = await skillRepository.add(skillDomainObject);

        skills.push(skillDomainObject);

        if (result.isErr()) throw new Error('Unexpected exception while adding skill');
      }

      for (const user of support.data.users) {
        const userId = new UserId(user.user_id);
        const email = Email.fromString(user.email);
        const userType = Type.fromString('mentor');

        const userDomainObject = new User(userId, email, userType);

        users.push(userDomainObject);

        const auth0UserId = new Auth0UserId(`auth0|${randomBetween(1000000000, 9999999999)}`);

        // @ts-expect-error the method is overloaded with auth0UserId as a second parameter
        const result = await userRepository.add(userDomainObject, auth0UserId);
        if (result.isErr()) throw new Error('Unexpected exception while adding user');
      }

      for (const person of support.data.persons) {
        // Add person
        const userId = new UserId(person.user_id);
        const personId = new PersonId(person.person_id);
        const firstName = person.firstname;
        const lastName = person.lastname;
        const phoneNumber = PhoneNumber.fromString(person.phone_number);
        const profilePhoto = person.profile_photo;

        const personDomainObject = new Person(
          personId,
          userId,
          firstName,
          lastName,
          phoneNumber,
          undefined,
          undefined,
          undefined,
          profilePhoto,
        );
        const addPersonResult = await personRepository.add(personDomainObject);
        if (addPersonResult.isErr()) {
          throw new Error('Unexpected exception while adding person');
        }
      }

      for (const mentor of support.data.mentors) {
        const mentorId = new MentorId(mentor.mentor_id);

        const profileTitle = mentor.profile_title;
        const profileDescription = mentor.profile_description;
        const currentJob = mentor.current_job;
        const availability = Availability.fromString(mentor.availability);
        const trainingType = mentor.training_type
          .split(',')
          .map((trainingType) => TrainingType.fromString(trainingType));
        const languages = mentor.languages.split(',').map((language) => Language.fromString(language));

        const mentorSettings = support.data.mentorProfileSettings.find(
          (settings) => settings.mentor_id === mentorId.value,
        );

        const mentorSettingsDomainObject = new MentorSettings(
          mentorId,
          Boolean(mentorSettings.display_nickname),
          Boolean(mentorSettings.display_profile_photo),
          Boolean(mentorSettings.display_location),
          Boolean(mentorSettings.display_email),
          Boolean(mentorSettings.display_phone_number),
          Boolean(mentorSettings.display_linkedin),
          Boolean(mentorSettings.display_current_job_title),
        );

        const mentorSkillsRaw = support.data.mentorSkills.filter((skill) => skill.mentor_id === mentorId.value);
        const mentorSkills: Skill[] = mentorSkillsRaw.map((skill) => skills.find((s) => s.id.value === skill.skill_id));

        const mentorDomainObject = new Mentor(
          mentorId,
          users.find((user) => user.id.value === mentor.user_id),
          profileDescription,
          availability,
          languages,
          trainingType,
          mentorSettingsDomainObject,
          mentorSkills,
          [],
          [],
          currentJob,
          profileTitle,
        );

        const result = await mentorRepository.add(mentorDomainObject);

        if (result.isErr()) throw new Error('Unexpected exception while adding mentor ');
        mentors.push(mentorDomainObject);

        const addMentorSkillsResult = await skillRepository.setMentorSkills(mentorId, mentorSkills);

        if (addMentorSkillsResult.isErr()) {
          throw new Error('Unexpected exception while adding mentor skills');
        }
      }

      for (const pricingPlan of support.data.mentorPricingPlans) {
        const id = new PricingPlanId(pricingPlan.pricing_plan_id);
        const mentorId = new MentorId(pricingPlan.mentor_id);
        const rate = Money.fromStringValues(pricingPlan.price_amount, pricingPlan.price_currency);
        const trainingType = TrainingType.fromString(pricingPlan.training_type);
        const pricingType = PricingType.fromString(pricingPlan.pricing_type);
        const title = pricingPlan.title;
        const pricingPlanObjectDomain = new PricingPlan(id, mentorId, rate, trainingType, pricingType, title);
        const addPricingPlanResult = await pricingPlanRepository.add(pricingPlanObjectDomain);

        if (addPricingPlanResult.isErr()) {
          throw new Error('Unexpected exception while adding pricing plan');
        }
        pricingPlans.push(pricingPlanObjectDomain);
      }

      return { users, skills, mentors, pricingPlans: pricingPlans };
    };

    const findUsingPriceRange = async () => {
      const { pricingPlans } = await insertData();
      const ids = (await mentorRepository.findAll())._unsafeUnwrap();
      const priceMin = Money.fromStringValues(100, 'EUR');
      const priceMax = Money.fromStringValues(200, 'EUR');

      const result = await mentorRepository.findByCriteria({ ids, priceMin, priceMax }, OrderBy.fromString('asc'));
      expect(result.isOk()).toBeTruthy();

      const unwrappedResult = result._unsafeUnwrap();

      const mentorIdsValuesRelatedToFilteredPricingPlans = pricingPlans
        .filter((pricingPlan) => pricingPlan.rate.amount.value >= 100 && pricingPlan.rate.amount.value <= 200)
        .map((pricingPlan) => pricingPlan.mentorId.value);

      const validation = unwrappedResult.every((mentor) =>
        mentorIdsValuesRelatedToFilteredPricingPlans.includes(mentor.id.value),
      );
      expect(validation).toBeTruthy();
    };

    const findUsingPricingType = async () => {
      const { pricingPlans } = await insertData();
      const pricingType = PricingType.fromString(PricingType.Daily);

      const ids = (await mentorRepository.findAll())._unsafeUnwrap();
      const result = await mentorRepository.findByCriteria({ ids, pricingType }, OrderBy.fromString('asc'));

      const unwrappedResult = result._unsafeUnwrap().filter((mentor) => {
        const pricingPlans = mentor.pricingPlans.map((pricingPlan) => pricingPlan.pricingType.value);
        return pricingPlans.includes(PricingType.Daily);
      });

      const mentorIdsValuesRelatedToFilteredPricingPlans = pricingPlans
        .filter((pricingPlan) => pricingPlan.pricingType.value === PricingType.Daily)
        .map((pricingPlan) => pricingPlan.mentorId.value);

      const validation = unwrappedResult.every((mentor) =>
        mentorIdsValuesRelatedToFilteredPricingPlans.includes(mentor.id.value),
      );

      expect(validation).toBeTruthy();
    };

    const findUsingSpecialization = async () => {
      const { mentors, skills } = await insertData();
      const ids = (await mentorRepository.findAll())._unsafeUnwrap();
      const filteredSkills = skills.filter((skill) => skill.name === 'javascript' || skill.name === 'php');
      const result = await mentorRepository.findByCriteria({ ids, skills: filteredSkills }, OrderBy.fromString('asc'));

      const unwrappedResult = result._unsafeUnwrap();

      const filteredMentors = mentors.filter((mentor) => {
        const mentorSkillNames = mentor.skills.map((skill) => skill.name);
        return mentorSkillNames.includes('javascript') && mentorSkillNames.includes('php');
      });

      expect(unwrappedResult.length).toEqual(filteredMentors.length);
    };

    const findUsingTrainingType = async () => {
      const { mentors } = await insertData();
      const ids = (await mentorRepository.findAll())._unsafeUnwrap();
      const trainingType = TrainingType.fromString('face_to_face');
      const result = await mentorRepository.findByCriteria(
        { ids, trainingType: [trainingType] },
        OrderBy.fromString('asc'),
      );

      const unwrappedResult = result._unsafeUnwrap();

      const filteredMentors = mentors.filter((mentor) => {
        const trainingType = mentor.trainingType.map((trainingType) => trainingType.value);
        return trainingType.includes(TrainingType.FaceToFace);
      });

      expect(filteredMentors.length).toEqual(unwrappedResult.length);
    };

    const findUsingMentorAvailability = async () => {
      const { mentors } = await insertData();
      const ids = (await mentorRepository.findAll())._unsafeUnwrap();

      const result = await mentorRepository.findByCriteria(
        {
          ids,
          availability: Availability.fromString(Availability.OneTime),
        },
        OrderBy.fromString('asc'),
      );

      const unwrappedResult = result._unsafeUnwrap();

      const filteredMentors = mentors.filter((mentor) => mentor.availability.value === Availability.OneTime);

      expect(filteredMentors.length).toEqual(unwrappedResult.length);
    };

    const findUsingMentorLanguages = async () => {
      const { mentors } = await insertData();

      const languages = [Language.fromString(Language.French)];
      const ids = (await mentorRepository.findAll())._unsafeUnwrap();

      const result = await mentorRepository.findByCriteria({ ids, languages }, OrderBy.fromString('asc'));

      const unwrappedResult = result._unsafeUnwrap();

      const filteredMentors = mentors.filter((mentor) => {
        const languages = mentor.languages.map((l) => l.value);
        return languages.includes(Language.French);
      });

      expect(unwrappedResult.length).toEqual(filteredMentors.length);
    };

    const findUsingOrderBy = async () => {
      await insertData();
      const ids = (await mentorRepository.findAll())._unsafeUnwrap();

      const DescResult = await mentorRepository.findByCriteria({ ids }, OrderBy.fromString('desc'));
      const AscResult = await mentorRepository.findByCriteria({ ids }, OrderBy.fromString('asc'));

      const unwrappedDescResult = DescResult._unsafeUnwrap();

      const unwrappedAscResult = AscResult._unsafeUnwrap();

      const sortedDescMentorsRawIds = [
        '1c35b918-0103-4886-86f8-88aa01a9dfc8',
        'ea61c1af-7a61-4935-b79b-9863d13ee574',
        '49a07dbb-9a0d-47d2-844f-ebf08080f5c5',
        '07c8c961-d4a9-4b7f-86ed-2b3828dcca63',
        'a3e1389a-45e8-43a2-9a9e-143b4e0fed20',
        '183b9194-9077-499d-afc7-87f1d024e592',
        'b2731b6b-543d-454a-b263-afc2e270d086',
      ];

      const sortedAscMentorsRawIds = [
        'b2731b6b-543d-454a-b263-afc2e270d086',
        '183b9194-9077-499d-afc7-87f1d024e592',
        'a3e1389a-45e8-43a2-9a9e-143b4e0fed20',
        '07c8c961-d4a9-4b7f-86ed-2b3828dcca63',
        '49a07dbb-9a0d-47d2-844f-ebf08080f5c5',
        'ea61c1af-7a61-4935-b79b-9863d13ee574',
        '1c35b918-0103-4886-86f8-88aa01a9dfc8',
      ];

      sortedDescMentorsRawIds.forEach((id, index) => {
        expect(unwrappedDescResult[index].id.value).toEqual(id);
      });

      sortedAscMentorsRawIds.forEach((id, index) => {
        expect(unwrappedAscResult[index].id.value).toEqual(id);
      });
    };

    await expect(runSequelizeTransaction(sequelize, findUsingPriceRange)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, findUsingPricingType)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, findUsingSpecialization)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, findUsingTrainingType)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, findUsingMentorAvailability)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, findUsingMentorLanguages)).rejects.toThrow('rollback');
    await expect(runSequelizeTransaction(sequelize, findUsingOrderBy)).rejects.toThrow('rollback');
  }, 30000);
});
