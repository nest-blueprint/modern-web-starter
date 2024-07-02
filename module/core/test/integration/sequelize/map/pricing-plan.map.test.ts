import { Sequelize } from 'sequelize-typescript';
import { ConfigLoaderToken } from '../../../../src/infrastructure/init/token.init';
import { appConfig } from '../../../../../../config/autoload/app.config';
import { Test } from '@nestjs/testing';
import { ConfigLoaderService } from '../../../../src/infrastructure/init/service/config-loader.service';
import { SequelizeProvider } from '../../../../src/infrastructure/sequelize/sequelize.provider';
import { SequelizeToken } from '../../../../src/infrastructure/sequelize/token/sequelize.token';
import { PricingPlan as PricingPlanEntity } from '../../../../../core/src/infrastructure/sequelize/entity/pricing-plan.entity';
import { Id as PricingPlanId } from '../../../../../core/src/domain/pricing-plan/id';
import { Id as MentorId } from '../../../../../core/src/domain/mentor/id';
import { Currency } from '../../../../src/domain/currency';
import { Amount } from '../../../../src/infrastructure/type/money/amount';
import { PricingPlan as PricingPlanRaw } from '../../../../../core/src/infrastructure/type/raw/pricing-plan.raw';
import { Type as PricingType } from '../../../../src/domain/pricing/type';
import { Type as TrainingType } from '../../../../src/domain/training/type';
import { PricingPlanMap } from '../../../../src/infrastructure/map/pricing-plan.map';
import { PricingPlan } from '../../../../src/domain/pricing-plan';
import { Money } from '../../../../src/domain/money';
import { Id as UserId } from '../../../../src/domain/user/id';
import { Email } from '../../../../src/domain/user/email';
import { Type } from '../../../../src/domain/user/type';
import { Auth0UserId } from '../../../../src/infrastructure/resource/auth0/type/auth0-user-id';
import { User } from '../../../../src/domain/user';
import { Availability } from '../../../../src/domain/mentor/availability';
import { Language } from '../../../../src/domain/language';
import { MentorSettings } from '../../../../src/domain/mentor-settings';
import { Mentor } from '../../../../src/domain/mentor';
import { CurrencyCode } from '../../../../src/domain/currency-code';
import { Transaction } from 'sequelize';
import { runSequelizeTransaction } from '../../util';
import { Mentor as MentorEntity } from '../../../../src/infrastructure/sequelize/entity/mentor.entity';
import { User as UserEntity } from '../../../../src/infrastructure/sequelize/entity/user.entity';
import { UserMap } from '../../../../src/infrastructure/map/user.map';
import { MentorMap } from '../../../../src/infrastructure/map/mentor.map';

describe('[Core/Infrastructure] PricingPlanMap', () => {
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

  test('PricingPlanMap.toEntity', async () => {
    // Safest way to ensure that PricingPlanMap.toEntity is working properly as expected
    // is to try to save it to the database and then retrieve it back.
    const mentorRepository = sequelize.getRepository(MentorEntity);
    const userRepository = sequelize.getRepository(UserEntity);
    const pricingPlanRepository = sequelize.getRepository(PricingPlanEntity);

    // Create user
    const userId = UserId.create();
    const email = new Email('john.doe@example.com');
    const userType = Type.fromString('mentor');
    const auth0UserId = new Auth0UserId('auth0|0123456789');

    const user = await new User(userId, email, userType);

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

    // Create pricing plan
    const id = PricingPlanId.create();
    const currency = Currency.fromString(CurrencyCode.EUR);
    const amount = new Amount(100);
    const rate = new Money(amount, currency);
    const trainingType = TrainingType.fromString(TrainingType.FaceToFace);
    const pricingType = PricingType.fromString(PricingType.Hourly);
    const title = 'Face to face (1h)';

    const pricingPlan = new PricingPlan(id, mentorId, rate, trainingType, pricingType, title);

    const createPricingPlanUsingEntity = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: auth0UserId.value };
      //@ts-expect-error avoid type error
      await userRepository.create(userJson, { transaction });

      const mentorRaw = { ...MentorMap.toRaw(mentor), user_id: userId.value };

      //@ts-expect-error avoid type error
      await mentorRepository.create(mentorRaw, { transaction });

      const pricingPlanEntity = PricingPlanMap.toEntity(pricingPlan);
      await pricingPlanEntity.save({ transaction });

      const pricingPlanEntityRawFromDatabase = await pricingPlanRepository.findByPk(pricingPlan.id.value, {
        transaction,
      });

      expect(pricingPlanEntityRawFromDatabase).toBeDefined();

      const pricingPlanRawFromDatabase = pricingPlanEntityRawFromDatabase.get({ plain: true });
      expect(pricingPlanRawFromDatabase).toBeDefined();
      expect(pricingPlanRawFromDatabase.pricing_plan_id).toEqual(pricingPlan.id.value);
      expect(pricingPlanRawFromDatabase.mentor_id).toEqual(mentorId.value);
      expect(pricingPlanRawFromDatabase.price_amount).toEqual(pricingPlan.rate.amount.value);
      expect(pricingPlanRawFromDatabase.price_currency).toEqual(pricingPlan.rate.currency.code);
      expect(pricingPlanRawFromDatabase.training_type).toEqual(pricingPlan.trainingType.value);
      expect(pricingPlanRawFromDatabase.pricing_type).toEqual(pricingPlan.pricingType.value);
      expect(pricingPlanRawFromDatabase.title).toEqual(pricingPlan.title);
    };

    await expect(runSequelizeTransaction(sequelize, createPricingPlanUsingEntity)).rejects.toThrow('rollback');
  });

  test('PricingPlan.toDomain', () => {
    // PricingPlanMap.toDomain(pricingPlan: PricingPlanEntity): Result<PricingPlan,Error>
    const pricingPlanRepository = sequelize.getRepository(PricingPlanEntity);
    const pricingPlan = pricingPlanRepository.build({
      pricing_plan_id: PricingPlanId.random(),
      mentor_id: MentorId.random(),
      title: 'Remote session',
      price_currency: Currency.fromString('EUR').code.toString(),
      price_amount: new Amount(100).value,
      pricing_type: PricingType.fromString('hourly').value,
      training_type: TrainingType.fromString('remote').value,
    });

    const mappedPricingPlanResult = PricingPlanMap.toDomain(pricingPlan);
    expect(mappedPricingPlanResult.isOk()).toBe(true);
    const mappedPricingPlan = mappedPricingPlanResult._unsafeUnwrap();
    expect(mappedPricingPlan).toBeInstanceOf(PricingPlan);
    expect(mappedPricingPlan.id).toBeInstanceOf(PricingPlanId);

    expect(mappedPricingPlan.mentorId).toBeInstanceOf(MentorId);
    expect(mappedPricingPlan.pricingType).toBeInstanceOf(PricingType);
    expect(mappedPricingPlan.trainingType).toBeInstanceOf(TrainingType);
    expect(mappedPricingPlan.title).toBe('Remote session');
    expect(mappedPricingPlan.rate).toBeInstanceOf(Money);

    // PricingPlanMap.toDomain(pricingPlan: PricingPlanRaw): Result<PricingPlan,Error>
    const pricingPlanRaw: PricingPlanRaw = {
      pricing_plan_id: PricingPlanId.random(),
      mentor_id: MentorId.random(),
      title: 'Remote session',
      price_currency: Currency.fromString('EUR').code.toString(),
      price_amount: new Amount(100).value,
      pricing_type: PricingType.fromString('hourly').value,
      training_type: TrainingType.fromString('remote').value,
    };

    const mappedPricingPlanResult2 = PricingPlanMap.toDomain(pricingPlanRaw);
    expect(mappedPricingPlanResult2.isOk()).toBe(true);
    const mappedPricingPlan2 = mappedPricingPlanResult2._unsafeUnwrap();

    expect(mappedPricingPlan2).toBeInstanceOf(PricingPlan);
    expect(mappedPricingPlan2.id).toBeInstanceOf(PricingPlanId);
    expect(mappedPricingPlan2.mentorId).toBeInstanceOf(MentorId);
    expect(mappedPricingPlan2.pricingType).toBeInstanceOf(PricingType);
    expect(mappedPricingPlan2.trainingType).toBeInstanceOf(TrainingType);
    expect(mappedPricingPlan2.rate).toBeInstanceOf(Money);

    expect(mappedPricingPlan2.title).toBe(pricingPlanRaw.title);
    expect(mappedPricingPlan2.rate.amount.value).toBe(pricingPlanRaw.price_amount);
    expect(mappedPricingPlan2.rate.currency.code).toBe(pricingPlanRaw.price_currency);
    expect(mappedPricingPlan2.pricingType.value).toBe(pricingPlanRaw.pricing_type);
    expect(mappedPricingPlan2.trainingType.value).toBe(pricingPlanRaw.training_type);
  });

  test('PricingPlan.toRaw', () => {
    const rate = Money.fromStringValues(100, 'EUR');
    const pricingPlan = new PricingPlan(
      PricingPlanId.create(),
      MentorId.create(),
      rate,
      TrainingType.fromString('remote'),
      PricingType.fromString('hourly'),
      'Remote session',
    );

    const pricingPlanRaw = PricingPlanMap.toRaw(pricingPlan);
    expect(pricingPlanRaw.title).toBe('Remote session');
    expect(pricingPlanRaw.mentor_id).toBe(pricingPlan.mentorId.value);
    expect(pricingPlanRaw.pricing_plan_id).toBe(pricingPlan.id.value);
    expect(pricingPlanRaw.price_currency).toBe('EUR');
    expect(pricingPlanRaw.price_amount).toBe(100);
    expect(pricingPlanRaw.pricing_type).toBe('hourly');
    expect(pricingPlanRaw.training_type).toBe('remote');
  });
});
