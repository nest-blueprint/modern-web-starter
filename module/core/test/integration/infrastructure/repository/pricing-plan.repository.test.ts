import { Repository, Sequelize } from 'sequelize-typescript';
import { PricingPlan as PricingPlanEntity } from '../../../../src/infrastructure/sequelize/entity/pricing-plan.entity';
import { User as UserEntity } from '../../../../src/infrastructure/sequelize/entity/user.entity';
import { Person as PersonEntity } from '../../../../src/infrastructure/sequelize/entity/person.entity';
import { Test } from '@nestjs/testing';
import { ConfigLoaderToken } from '../../../../src/infrastructure/init/token.init';
import { appConfig } from '../../../../../../config/autoload/app.config';
import { SequelizeProvider } from '../../../../src/infrastructure/sequelize/sequelize.provider';
import { MentorRepositoryFactory } from '../../../../src/infrastructure/repository/factory/mentor.repository.factory';
import { ConfigLoaderService } from '../../../../src/infrastructure/init/service/config-loader.service';
import { MentorRepository } from '../../../../src/infrastructure/repository/mentor.repository';
import { PricingPlanRepository } from '../../../../src/infrastructure/repository/pricing-plan.repository';
import { PricingPlanRepositoryFactory } from '../../../../src/infrastructure/repository/factory/pricing-plan.repository.factory';
import { SequelizeToken } from '../../../../src/infrastructure/sequelize/token/sequelize.token';
import {
  MentorCollectionToken,
  PricingPlanCollectionToken,
} from '../../../../src/infrastructure/repository/factory/token.factory';
import { Id as UserId } from '../../../../src/domain/user/id';
import { Email } from '../../../../src/domain/user/email';
import { User } from '../../../../src/domain/user';
import { Id as PersonId } from '../../../../src/domain/person/id';
import { Person } from '../../../../src/domain/person';
import { Id as MentorId } from '../../../../src/domain/mentor/id';
import { Availability } from '../../../../src/domain/mentor/availability';
import { Language } from '../../../../src/domain/language';
import { Type as TrainingType } from '../../../../src/domain/training/type';
import { MentorSettings } from '../../../../src/domain/mentor-settings';
import { Mentor } from '../../../../src/domain/mentor';
import { runSequelizeTransaction } from '../../util';
import { Transaction } from 'sequelize';
import { UserMap } from '../../../../src/infrastructure/map/user.map';
import { PersonMap } from '../../../../src/infrastructure/map/person.map';
import { Mentor as MentorEntity } from '../../../../src/infrastructure/sequelize/entity/mentor.entity';
import { PricingPlan } from '../../../../src/domain/pricing-plan';
import { Currency } from '../../../../src/domain/currency';
import { CurrencyCode } from '../../../../src/domain/currency-code';
import { Amount } from '../../../../src/infrastructure/type/money/amount';
import { Money } from '../../../../src/domain/money';
import { Type as PricingType } from '../../../../src/domain/pricing/type';
import { Id as PricingPlanId } from '../../../../src/domain/pricing-plan/id';
import { PricingPlanMap } from '../../../../src/infrastructure/map/pricing-plan.map';
import { MentorMap } from '../../../../src/infrastructure/map/mentor.map';
import { PricingPlanAlreadyExistException } from '../../../../src/infrastructure/exception/pricing-plan-already-exist.exception';
import { PricingPlanNotFoundException } from '../../../../src/infrastructure/exception/pricing-plan-not-found.exception';
import { Type } from '../../../../src/domain/user/type';
import { Auth0UserId } from '../../../../src/infrastructure/resource/auth0/type/auth0-user-id';

describe('[Core/Infrastructure] PricingPlan Repository', () => {
  let sequelize: Sequelize;

  let sequelizePricingPlanRepository: Repository<PricingPlanEntity>;

  let sequelizeUserRepository: Repository<UserEntity>;
  let sequelizePersonRepository: Repository<PersonEntity>;
  let sequelizeMentorRepository: Repository<MentorEntity>;

  let mentorRepository: MentorRepository;
  let pricingPlanRepository: PricingPlanRepository;

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
        PricingPlanRepositoryFactory,
      ],
    }).compile();

    sequelize = module.get<Sequelize>(SequelizeToken);
    sequelizePricingPlanRepository = sequelize.getRepository(PricingPlanEntity);

    sequelizeUserRepository = sequelize.getRepository(UserEntity);
    sequelizePersonRepository = sequelize.getRepository(PersonEntity);
    sequelizeMentorRepository = sequelize.getRepository(MentorEntity);

    mentorRepository = module.get(MentorCollectionToken);
    pricingPlanRepository = module.get(PricingPlanCollectionToken);
  });

  it('sequelize should be instanced ', async () => {
    expect(sequelize).toBeDefined();
    expect(sequelize).toBeInstanceOf(Sequelize);
  });

  it('sequelizePricingPlanRepository should be instanced ', async () => {
    expect(sequelizePricingPlanRepository).toBeDefined();
  });

  it('sequelizeUserRepository should be instanced ', async () => {
    expect(sequelizeUserRepository).toBeDefined();
  });

  it('sequelizePersonRepository should be instanced ', async () => {
    expect(sequelizePersonRepository).toBeDefined();
  });

  it('mentorRepository should be instanced ', async () => {
    expect(mentorRepository).toBeDefined();
    expect(mentorRepository).toBeInstanceOf(MentorRepository);
  });

  it('pricingPlanRepository should be instanced ', async () => {
    expect(pricingPlanRepository).toBeDefined();
    expect(pricingPlanRepository).toBeInstanceOf(PricingPlanRepository);
  });

  test('add', async () => {
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

    const id = PricingPlanId.create();
    const currency = Currency.fromString(CurrencyCode.EUR);
    const amount = new Amount(100);
    const rate = new Money(amount, currency);
    const trainingType = TrainingType.fromString(TrainingType.FaceToFace);
    const pricingType = PricingType.fromString(PricingType.Hourly);
    const title = 'Face to face (1h)';

    const pricingPlan = new PricingPlan(id, mentorId, rate, trainingType, pricingType, title);

    const addPricingPlanTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid type casting for the method toRaw()
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });

      const addPricingPlanResult = await pricingPlanRepository.add(pricingPlan);
      expect(addPricingPlanResult.isOk()).toBeTruthy();

      expect(addPricingPlanResult._unsafeUnwrap()).toBeInstanceOf(PricingPlan);
      expect(addPricingPlanResult._unsafeUnwrap().id.value).toEqual(id.value);
    };

    const addPricingPlanTest2 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid type casting for the method toRaw()
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });

      //@ts-expect-error avoid type casting for the method toRaw()
      await sequelizePricingPlanRepository.create(PricingPlanMap.toJSON(pricingPlan), { transaction });

      const addPricingPlanResult = await pricingPlanRepository.add(pricingPlan);

      expect(addPricingPlanResult.isErr()).toBeTruthy();
      expect(addPricingPlanResult._unsafeUnwrapErr()).toBeInstanceOf(PricingPlanAlreadyExistException);
    };

    await expect(runSequelizeTransaction(sequelize, addPricingPlanTest1)).rejects.toThrowError('rollback');
    await expect(runSequelizeTransaction(sequelize, addPricingPlanTest2)).rejects.toThrowError('rollback');
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

    const id = PricingPlanId.create();
    const currency = Currency.fromString(CurrencyCode.EUR);
    const amount = new Amount(100);
    const rate = new Money(amount, currency);
    const trainingType = TrainingType.fromString(TrainingType.FaceToFace);
    const pricingType = PricingType.fromString(PricingType.Hourly);
    const title = 'Face to face (1h)';

    const pricingPlan = new PricingPlan(id, mentorId, rate, trainingType, pricingType, title);

    const deletePricingPlanTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid type casting for the method toRaw()
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });

      //@ts-expect-error avoid type casting for the method toRaw()
      await sequelizePricingPlanRepository.create(PricingPlanMap.toJSON(pricingPlan), { transaction });

      const deletePricingPlanResult = await pricingPlanRepository.delete(id);

      expect(deletePricingPlanResult.isOk()).toBeTruthy();
      expect(deletePricingPlanResult._unsafeUnwrap()).toBeInstanceOf(PricingPlan);
      expect(deletePricingPlanResult._unsafeUnwrap().id.value).toEqual(id.value);
    };

    const deletePricingPlanTest2 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid type casting for the method toRaw()
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });

      const deletePricingPlanResult = await pricingPlanRepository.delete(id);

      expect(deletePricingPlanResult.isErr()).toBeTruthy();
      expect(deletePricingPlanResult._unsafeUnwrapErr()).toBeInstanceOf(PricingPlanNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, deletePricingPlanTest1)).rejects.toThrowError('rollback');
    await expect(runSequelizeTransaction(sequelize, deletePricingPlanTest2)).rejects.toThrowError('rollback');
  });

  test('find', async () => {
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

    const id = PricingPlanId.create();
    const currency = Currency.fromString(CurrencyCode.EUR);
    const amount = new Amount(100);
    const rate = new Money(amount, currency);
    const trainingType = TrainingType.fromString(TrainingType.FaceToFace);
    const pricingType = PricingType.fromString(PricingType.Hourly);
    const title = 'Face to face (1h)';

    const pricingPlan = new PricingPlan(id, mentorId, rate, trainingType, pricingType, title);

    const findPricingPlanTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid type casting for the method toRaw()
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });

      const findPricingPlanResult = await pricingPlanRepository.find(id);

      expect(findPricingPlanResult.isOk()).toBeTruthy();
      expect(findPricingPlanResult._unsafeUnwrap()).toEqual(null);
    };

    const findPricingPlanTest2 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid type casting for the method toRaw()
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });

      //@ts-expect-error avoid type casting for the method toRaw()
      await sequelizePricingPlanRepository.create(PricingPlanMap.toJSON(pricingPlan), { transaction });

      const findPricingPlanResult = await pricingPlanRepository.find(id);
      expect(findPricingPlanResult.isOk()).toBeTruthy();
      expect(findPricingPlanResult._unsafeUnwrap()).toBeInstanceOf(PricingPlan);
      expect(findPricingPlanResult._unsafeUnwrap().id.value).toEqual(id.value);
    };

    await expect(runSequelizeTransaction(sequelize, findPricingPlanTest1)).rejects.toThrowError('rollback');
    await expect(runSequelizeTransaction(sequelize, findPricingPlanTest2)).rejects.toThrowError('rollback');
  });

  test('getFromMentorId', async () => {
    // Create user
    const userId = UserId.create();
    const email = new Email('john.doe@example.com');
    const userType = Type.fromString('mentor');
    const auth0Id = new Auth0UserId('auth0|123456789');

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

    const id = PricingPlanId.create();
    const currency = Currency.fromString(CurrencyCode.EUR);
    const amount = new Amount(100);
    const rate = new Money(amount, currency);
    const trainingType = TrainingType.fromString(TrainingType.FaceToFace);
    const pricingType = PricingType.fromString(PricingType.Hourly);
    const title = 'Face to face (1h)';

    const pricingPlan = new PricingPlan(id, mentorId, rate, trainingType, pricingType, title);

    const getPricingPlansTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid type casting for the method toRaw()
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });

      const getPricingPlansResult = await pricingPlanRepository.getFromMentorId(mentorId);

      expect(getPricingPlansResult.isErr()).toBeTruthy();
      expect(getPricingPlansResult._unsafeUnwrapErr()).toBeInstanceOf(PricingPlanNotFoundException);
    };

    const getPricingPlansTest2 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid type casting for the method toRaw()
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });

      //@ts-expect-error avoid type casting for the method toRaw()
      await sequelizePricingPlanRepository.create(PricingPlanMap.toJSON(pricingPlan), { transaction });

      const getPricingPlansResult = await pricingPlanRepository.getFromMentorId(mentorId);

      expect(getPricingPlansResult.isOk()).toBeTruthy();
      expect(Array.isArray(getPricingPlansResult._unsafeUnwrap())).toBeTruthy();
      expect(getPricingPlansResult._unsafeUnwrap().length).toEqual(1);
      expect(getPricingPlansResult._unsafeUnwrap()[0]).toBeInstanceOf(PricingPlan);
      expect(getPricingPlansResult._unsafeUnwrap()[0].id.value).toEqual(id.value);
    };

    await expect(runSequelizeTransaction(sequelize, getPricingPlansTest1)).rejects.toThrowError('rollback');
    await expect(runSequelizeTransaction(sequelize, getPricingPlansTest2)).rejects.toThrowError('rollback');
  });

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

    const id = PricingPlanId.create();
    const currency = Currency.fromString(CurrencyCode.EUR);
    const amount = new Amount(100);
    const rate = new Money(amount, currency);
    const trainingType = TrainingType.fromString(TrainingType.FaceToFace);
    const trainingType2 = TrainingType.fromString(TrainingType.Remote);
    const pricingType = PricingType.fromString(PricingType.Hourly);
    const title = 'Face to face (1h)';

    const pricingPlan = new PricingPlan(id, mentorId, rate, trainingType, pricingType, title);

    const pricingPlanUpdated = new PricingPlan(id, mentorId, rate, trainingType2, pricingType, 'Remote (1h)');

    const updatePricingPlanTest1 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid annoying typing errors
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });

      //@ts-expect-error avoid annoying typing errors
      await sequelizePricingPlanRepository.create(PricingPlanMap.toJSON(pricingPlan), { transaction });

      const updatePricingPlanResult = await pricingPlanRepository.update(pricingPlanUpdated);

      expect(updatePricingPlanResult.isOk()).toBeTruthy();
      expect(updatePricingPlanResult._unsafeUnwrap()).toBeInstanceOf(PricingPlan);

      expect(updatePricingPlanResult._unsafeUnwrap().id.value).toEqual(id.value);
      expect(updatePricingPlanResult._unsafeUnwrap().trainingType.value).toEqual(trainingType2.value);
      expect(updatePricingPlanResult._unsafeUnwrap().title).toEqual(pricingPlanUpdated.title);
    };

    const updatePricingPlanTest2 = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: 'auth0|9888238429' };
      //@ts-expect-error typing error with person property
      await sequelizeUserRepository.create(userJson, { transaction });

      await sequelizePersonRepository.create(PersonMap.toJSON(person), { transaction });

      //@ts-expect-error avoid annoying typing errors
      await sequelizeMentorRepository.create({ ...MentorMap.toRaw(mentor), user_id: userId.value }, { transaction });

      const updatePricingPlanResult = await pricingPlanRepository.update(pricingPlanUpdated);

      expect(updatePricingPlanResult.isErr()).toBeTruthy();
      expect(updatePricingPlanResult._unsafeUnwrapErr()).toBeInstanceOf(PricingPlanNotFoundException);
    };

    await expect(runSequelizeTransaction(sequelize, updatePricingPlanTest1)).rejects.toThrowError('rollback');
    await expect(runSequelizeTransaction(sequelize, updatePricingPlanTest2)).rejects.toThrowError('rollback');
  });
});
