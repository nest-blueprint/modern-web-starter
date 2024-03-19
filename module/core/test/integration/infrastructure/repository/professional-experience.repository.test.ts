import { Repository, Sequelize } from 'sequelize-typescript';
import { ProfessionalExperience as ProfessionalExperienceEntity } from '../../../../src/infrastructure/sequelize/entity/professional-experience.entity';
import { User as UserEntity } from '../../../../src/infrastructure/sequelize/entity/user.entity';
import { Person as PersonEntity } from '../../../../src/infrastructure/sequelize/entity/person.entity';
import { Test } from '@nestjs/testing';
import { ConfigLoaderToken } from '../../../../src/infrastructure/init/token.init';
import { appConfig } from '../../../../../../config/autoload/app.config';
import { SequelizeProvider } from '../../../../src/infrastructure/sequelize/sequelize.provider';
import { MentorRepositoryFactory } from '../../../../src/infrastructure/repository/factory/mentor.repository.factory';
import { ConfigLoaderService } from '../../../../src/infrastructure/init/service/config-loader.service';
import { SequelizeToken } from '../../../../src/infrastructure/sequelize/token/sequelize.token';
import { ProfessionalExperienceCollectionToken } from '../../../../src/infrastructure/repository/factory/token.factory';
import { ProfessionalExperienceRepositoryFactory } from '../../../../src/infrastructure/repository/factory/professional-experience.repository.factory';
import { ProfessionalExperienceRepository } from '../../../../src/infrastructure/repository/professional-experience.repository';
import { Id as UserId } from '../../../../src/domain/user/id';
import { Email } from '../../../../src/domain/user/email';
import { User } from '../../../../src/domain/user';
import { Id as PersonId } from '../../../../src/domain/person/id';
import { Person } from '../../../../src/domain/person';
import { Id as MentorId } from '../../../../src/domain/mentor/id';
import { Id as ProfessionalExperienceId } from '../../../../src/domain/professional-experience/id';
import { Availability } from '../../../../src/domain/mentor/availability';
import { Language } from '../../../../src/domain/language';
import { Type as TrainingType } from '../../../../src/domain/training/type';
import { MentorSettings } from '../../../../src/domain/mentor-settings';
import { Mentor } from '../../../../src/domain/mentor';
import { Period } from '../../../../src/domain/professional-experience/period';
import { ProfessionalExperience } from '../../../../src/domain/professional-experience';
import { Transaction } from 'sequelize';
import { runSequelizeTransaction } from '../../util';
import { UserMap } from '../../../../src/infrastructure/map/user.map';
import { PersonMap } from '../../../../src/infrastructure/map/person.map';
import { Mentor as MentorEntity } from '../../../../src/infrastructure/sequelize/entity/mentor.entity';
import { MentorMap } from '../../../../src/infrastructure/map/mentor.map';
import { ProfessionalExperienceMap } from '../../../../src/infrastructure/map/professional-experience.map';
import { ProfessionalExperienceAlreadyExistsException } from '../../../../src/infrastructure/exception/professional-experience-already-exists.exception';
import { ProfessionalExperienceNotFoundException } from '../../../../src/infrastructure/exception/professional-experience-not-found.exception';
import { Type } from '../../../../src/domain/user/type';

describe('[Core/Infrastructure] ProfessionalExperience Repository', () => {
  let sequelize: Sequelize;

  let sequelizeProfessionalExperience: Repository<ProfessionalExperienceEntity>;

  let sequelizeUserRepository: Repository<UserEntity>;
  let sequelizePersonRepository: Repository<PersonEntity>;
  let sequelizeMentorRepository: Repository<MentorEntity>;

  let professionalExperienceRepository: ProfessionalExperienceRepository;

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
        MentorRepositoryFactory,
        ProfessionalExperienceRepositoryFactory,
      ],
    }).compile();

    sequelize = module.get<Sequelize>(SequelizeToken);
    sequelizeProfessionalExperience = sequelize.getRepository(ProfessionalExperienceEntity);

    sequelizeUserRepository = sequelize.getRepository(UserEntity);
    sequelizePersonRepository = sequelize.getRepository(PersonEntity);

    sequelizeMentorRepository = sequelize.getRepository(MentorEntity);
    professionalExperienceRepository = module.get(ProfessionalExperienceCollectionToken);
  });

  it('sequelize should be instanced ', async () => {
    expect(sequelize).toBeDefined();
    expect(sequelize).toBeInstanceOf(Sequelize);
  });

  it('sequelizePricingPlanRepository should be instanced ', async () => {
    expect(sequelizeProfessionalExperience).toBeDefined();
  });

  it('sequelizeUserRepository should be instanced ', async () => {
    expect(sequelizeUserRepository).toBeDefined();
  });

  it('sequelizePersonRepository should be instanced ', async () => {
    expect(sequelizePersonRepository).toBeDefined();
  });

  it('professionalExperienceRepository should be instanced ', async () => {
    expect(sequelizeProfessionalExperience).toBeDefined();
  });

  test('add', async () => {
    // Create user
    const userId = UserId.create();
    const email = new Email('john1.doe@example.com');
    const userType = new Type(Type.Mentor);

    const user = await new User(userId, email, userType);

    // Create person
    const personId = PersonId.create();
    const person = new Person(personId, userId, 'John', 'Doe', null, null, null, null, null);

    // Create mentor

    const mentorId = MentorId.create();
    const description = "I'm a  great mentor";
    const availability = Availability.fromString(Availability.FullTime);
    const languages = [Language.fromString(Language.French), new Language(Language.French)];
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
      'Web Developer',
      'Web Developer',
    );

    // Create professional professional-experience
    const professionalExperienceId = ProfessionalExperienceId.create();

    const startDate = new Date(2020, 0, 1);
    const endDate = new Date(2022, 6, 15);
    const company = 'SuperCompany';
    const jobTitle = 'Web Developer';
    const period = Period.fromString(startDate.toISOString(), endDate.toISOString(), 'month');

    const professionalExperience = new ProfessionalExperience(
      professionalExperienceId,
      jobTitle,
      company,
      period,
      mentorId,
    );

    const addTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid type casting for the method toRaw()
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });

      const addProfessionalExperienceResult = await professionalExperienceRepository.add(professionalExperience);

      expect(addProfessionalExperienceResult.isOk()).toBeTruthy();
      expect(addProfessionalExperienceResult._unsafeUnwrap().id.value).toEqual(professionalExperienceId.value);
    };

    const addTest2 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid type casting for the method toRaw()
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });

      await sequelizeProfessionalExperience.create(ProfessionalExperienceMap.toJSON(professionalExperience), {
        transaction,
      });

      const addProfessionalExperienceResult = await professionalExperienceRepository.add(professionalExperience);

      expect(addProfessionalExperienceResult.isErr()).toBeTruthy();
      expect(addProfessionalExperienceResult._unsafeUnwrapErr()).toBeInstanceOf(
        ProfessionalExperienceAlreadyExistsException,
      );
    };

    await expect(runSequelizeTransaction(sequelize, addTest1)).rejects.toThrow();
    await expect(runSequelizeTransaction(sequelize, addTest2)).rejects.toThrow();
  });

  test('get', async () => {
    // Create user
    const userId = UserId.create();
    const email = new Email('john.doe@example.com');
    const userType = new Type(Type.Mentor);

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

    // Create professional professional-experience
    const professionalExperienceId = ProfessionalExperienceId.create();

    const startDate = new Date(2020, 0, 1);
    const endDate = new Date(2022, 6, 15);
    const company = 'SuperCompany';
    const jobTitle = 'Developer';
    const period = Period.fromString(startDate.toISOString(), endDate.toISOString(), 'month');

    const professionalExperience = new ProfessionalExperience(
      professionalExperienceId,
      jobTitle,
      company,
      period,
      mentorId,
    );

    const getTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid type casting for the method toRaw()
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });
      await sequelizeProfessionalExperience.create(ProfessionalExperienceMap.toJSON(professionalExperience), {
        transaction,
      });

      const getProfessionalExperienceResult = await professionalExperienceRepository.get(professionalExperienceId);

      expect(getProfessionalExperienceResult.isOk()).toBeTruthy();
      expect(getProfessionalExperienceResult._unsafeUnwrap().id.value).toEqual(professionalExperienceId.value);
    };

    const getTest2 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid type casting for the method toRaw()
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });

      const getProfessionalExperienceResult = await professionalExperienceRepository.get(professionalExperienceId);
      expect(getProfessionalExperienceResult.isErr()).toBeTruthy();
      expect(getProfessionalExperienceResult._unsafeUnwrapErr()).toBeInstanceOf(
        ProfessionalExperienceNotFoundException,
      );
    };

    await expect(runSequelizeTransaction(sequelize, getTest1)).rejects.toThrow();
    await expect(runSequelizeTransaction(sequelize, getTest2)).rejects.toThrow();
  });

  test('delete', async () => {
    // Create user
    const userId = UserId.create();
    const email = new Email('john.doe@example.com');
    const userType = new Type(Type.Mentor);

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

    // Create professional professional-experience
    const professionalExperienceId = ProfessionalExperienceId.create();

    const startDate = new Date(2020, 0, 1);
    const endDate = new Date(2022, 6, 15);
    const company = 'SuperCompany';
    const jobTitle = 'Developer';
    const period = Period.fromString(startDate.toISOString(), endDate.toISOString(), 'month');

    const professionalExperience = new ProfessionalExperience(
      professionalExperienceId,
      jobTitle,
      company,
      period,
      mentorId,
    );

    const deleteTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid annoying type errors
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });
      await sequelizeProfessionalExperience.create(ProfessionalExperienceMap.toJSON(professionalExperience), {
        transaction,
      });

      const deleteProfessionalExperienceResult = await professionalExperienceRepository.delete(
        professionalExperienceId,
      );

      expect(deleteProfessionalExperienceResult.isOk()).toBeTruthy();
      expect(deleteProfessionalExperienceResult._unsafeUnwrap()).toBeInstanceOf(ProfessionalExperience);
      expect(deleteProfessionalExperienceResult._unsafeUnwrap().id.value).toEqual(professionalExperienceId.value);
    };

    const deleteTest2 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid annoying type errors
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });

      const deleteProfessionalExperienceResult = await professionalExperienceRepository.delete(
        professionalExperienceId,
      );

      expect(deleteProfessionalExperienceResult.isErr()).toBeTruthy();
      expect(deleteProfessionalExperienceResult._unsafeUnwrapErr()).toBeInstanceOf(
        ProfessionalExperienceNotFoundException,
      );
    };

    await expect(runSequelizeTransaction(sequelize, deleteTest1)).rejects.toThrow();
    await expect(runSequelizeTransaction(sequelize, deleteTest2)).rejects.toThrow();
  });

  test('getFromMentor', async () => {
    // Create user
    const userId = UserId.create();
    const email = new Email('john.doe@example.com');
    const userType = new Type(Type.Mentor);

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

    // Create professional professional-experience
    const professionalExperienceId = ProfessionalExperienceId.create();

    const startDate = new Date(2020, 0, 1);
    const endDate = new Date(2022, 6, 15);
    const company = 'SuperCompany';
    const jobTitle = 'Developer';
    const period = Period.fromString(startDate.toISOString(), endDate.toISOString(), 'month');

    const professionalExperience = new ProfessionalExperience(
      professionalExperienceId,
      jobTitle,
      company,
      period,
      mentorId,
    );

    const getFromMentorTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid annoying type errors
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });
      await sequelizeProfessionalExperience.create(ProfessionalExperienceMap.toJSON(professionalExperience), {
        transaction,
      });

      const getProfessionalExperienceResult = await professionalExperienceRepository.getFromMentor(mentorId);

      expect(getProfessionalExperienceResult.isOk()).toBeTruthy();
      expect(Array.isArray(getProfessionalExperienceResult._unsafeUnwrap())).toBeTruthy();
      expect(getProfessionalExperienceResult._unsafeUnwrap().length).toEqual(1);
      expect(getProfessionalExperienceResult._unsafeUnwrap()[0].id.value).toEqual(professionalExperienceId.value);
    };

    const getFromMentorTest2 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid annoying type errors
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });

      const getProfessionalExperienceResult = await professionalExperienceRepository.getFromMentor(MentorId.create());

      expect(getProfessionalExperienceResult.isErr()).toBeTruthy();
      expect(getProfessionalExperienceResult._unsafeUnwrapErr()).toBeInstanceOf(
        ProfessionalExperienceNotFoundException,
      );
    };

    await expect(runSequelizeTransaction(sequelize, getFromMentorTest1)).rejects.toThrowError('rollback');
    await expect(runSequelizeTransaction(sequelize, getFromMentorTest2)).rejects.toThrowError('rollback');
  });

  test('findFromMentor', async () => {
    // Create user
    const userId = UserId.create();
    const email = new Email('john.doe@example.com');
    const userType = new Type(Type.Mentor);

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

    // Create professional professional-experience
    const professionalExperienceId = ProfessionalExperienceId.create();

    const startDate = new Date(2020, 0, 1);
    const endDate = new Date(2022, 6, 15);
    const company = 'SuperCompany';
    const jobTitle = 'Developer';
    const period = Period.fromString(startDate.toISOString(), endDate.toISOString(), 'month');

    const professionalExperience = new ProfessionalExperience(
      professionalExperienceId,
      jobTitle,
      company,
      period,
      mentorId,
    );

    const findFromMentorTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid annoying type errors
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });
      await sequelizeProfessionalExperience.create(ProfessionalExperienceMap.toJSON(professionalExperience), {
        transaction,
      });

      const findProfessionalExperienceResult = await professionalExperienceRepository.findFromMentor(mentorId);

      expect(findProfessionalExperienceResult.isOk()).toBeTruthy();
      expect(Array.isArray(findProfessionalExperienceResult._unsafeUnwrap())).toBeTruthy();
      expect(findProfessionalExperienceResult._unsafeUnwrap().length).toEqual(1);
      expect(findProfessionalExperienceResult._unsafeUnwrap()[0].id.value).toEqual(professionalExperienceId.value);
    };

    const findFromMentorTest2 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid annoying type errors
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });

      const findProfessionalExperienceResult = await professionalExperienceRepository.findFromMentor(MentorId.create());

      expect(findProfessionalExperienceResult.isOk()).toBeTruthy();
      expect(Array.isArray(findProfessionalExperienceResult._unsafeUnwrap())).toBeTruthy();

      expect(findProfessionalExperienceResult._unsafeUnwrap().length).toEqual(0);
    };

    await expect(runSequelizeTransaction(sequelize, findFromMentorTest1)).rejects.toThrowError('rollback');
    await expect(runSequelizeTransaction(sequelize, findFromMentorTest2)).rejects.toThrowError('rollback');
  });

  test('update', async () => {
    // Create user
    const userId = UserId.create();
    const email = new Email('john.doe@example.com');
    const userType = new Type(Type.Mentor);

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

    // Create professional professional-experience
    const professionalExperienceId = ProfessionalExperienceId.create();

    const startDate = new Date(2020, 0, 1);
    const endDate = new Date(2022, 6, 15);
    const company = 'SuperCompany';
    const jobTitle = 'Developer';
    const jobTitle2 = 'Lead Developer';
    const period = Period.fromString(startDate.toISOString(), endDate.toISOString(), 'month');

    const professionalExperience = new ProfessionalExperience(
      professionalExperienceId,
      jobTitle,
      company,
      period,
      mentorId,
    );

    const updateProfessionalExperience = new ProfessionalExperience(
      professionalExperienceId,
      jobTitle2,
      company,
      period,
      mentorId,
    );

    const updateTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid annoying type errors
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });
      await sequelizeProfessionalExperience.create(ProfessionalExperienceMap.toJSON(professionalExperience), {
        transaction,
      });

      const updateProfessionalExperienceResult = await professionalExperienceRepository.update(
        updateProfessionalExperience,
      );

      expect(updateProfessionalExperienceResult.isOk()).toBeTruthy();
      expect(updateProfessionalExperienceResult._unsafeUnwrap().jobTitle).toEqual(jobTitle2);
      expect(updateProfessionalExperienceResult._unsafeUnwrap().id.value).toEqual(professionalExperienceId.value);
    };

    const updateTest2 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid annoying type errors
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });

      const updateProfessionalExperienceResult = await professionalExperienceRepository.update(
        new ProfessionalExperience(ProfessionalExperienceId.create(), jobTitle, company, period, mentorId),
      );

      expect(updateProfessionalExperienceResult.isErr()).toBeTruthy();
      expect(updateProfessionalExperienceResult._unsafeUnwrapErr()).toBeInstanceOf(
        ProfessionalExperienceNotFoundException,
      );
    };

    await expect(runSequelizeTransaction(sequelize, updateTest1)).rejects.toThrowError('rollback');
    await expect(runSequelizeTransaction(sequelize, updateTest2)).rejects.toThrowError('rollback');
  });

  test('count', async () => {
    // Create user
    const userId = UserId.create();
    const email = new Email('john.doe@example.com');
    const userType = new Type(Type.Mentor);

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

    // Create professional professional-experience
    const professionalExperienceId = ProfessionalExperienceId.create();

    const startDate = new Date(2020, 0, 1);
    const endDate = new Date(2022, 6, 15);
    const company = 'SuperCompany';
    const jobTitle = 'Developer';

    const period = Period.fromString(startDate.toISOString(), endDate.toISOString(), 'month');

    const professionalExperience = new ProfessionalExperience(
      professionalExperienceId,
      jobTitle,
      company,
      period,
      mentorId,
    );

    const countTest = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid annoying type errors
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });
      await sequelizeProfessionalExperience.create(ProfessionalExperienceMap.toJSON(professionalExperience), {
        transaction,
      });

      const countResult = await professionalExperienceRepository.count();

      expect(countResult.isOk()).toBeTruthy();
      expect(countResult._unsafeUnwrap()).toEqual(1);
    };

    await expect(runSequelizeTransaction(sequelize, countTest)).rejects.toThrowError('rollback');
  });
});
