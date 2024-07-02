import { Sequelize } from 'sequelize-typescript';
import { Test } from '@nestjs/testing';
import { ConfigLoaderToken } from '../../../../src/infrastructure/init/token.init';
import { appConfig } from '../../../../../../config/autoload/app.config';
import { ConfigLoaderService } from '../../../../src/infrastructure/init/service/config-loader.service';
import { MentorRepositoryFactory } from '../../../../src/infrastructure/repository/factory/mentor.repository.factory';
import { SequelizeProvider } from '../../../../src/infrastructure/sequelize/sequelize.provider';
import { SequelizeToken } from '../../../../src/infrastructure/sequelize/token/sequelize.token';
import { Id as MentorId } from '../../../../../core/src/domain/mentor/id';
import { Id as PricingPlanId } from '../../../../../core/src/domain/pricing-plan/id';
import { Id as ProfessionalExperienceId } from '../../../../../core/src/domain/professional-experience/id';
import { MentorMap } from '../../../../src/infrastructure/map/mentor.map';
import { Availability } from '../../../../src/domain/mentor/availability';
import { Language } from '../../../../src/domain/language';
import { Type as TrainingType } from '../../../../src/domain/training/type';
import { ProfessionalExperience } from '../../../../src/domain/professional-experience';
import { PricingPlan } from '../../../../src/domain/pricing-plan';
import { MentorSettings } from '../../../../src/domain/mentor-settings';
import { Period } from '../../../../src/domain/professional-experience/period';
import { Money } from '../../../../src/domain/money';
import { Type as PricingType } from '../../../../src/domain/pricing/type';
import { Mentor } from '../../../../src/domain/mentor';
import { User } from '../../../../src/domain/user';
import { Id as UserId } from '../../../../../core/src/domain/user/id';
import { Email } from '../../../../src/domain/user/email';
import { Skill } from '../../../../src/domain/skill';
import { Type } from '../../../../src/domain/user/type';
import { User as UserEntity } from '../../../../src/infrastructure/sequelize/entity/user.entity';
import { Transaction } from 'sequelize';
import { runSequelizeTransaction } from '../../util';
import { UserMap } from '../../../../src/infrastructure/map/user.map';
import { randomBetween } from '../../../double/provider/external/auth0/util/auth0.util';
import { Auth0UserId } from '../../../../src/infrastructure/resource/auth0/type/auth0-user-id';
import { Mentor as MentorEntity } from '../../../../src/infrastructure/sequelize/entity/mentor.entity';

describe('[Core/Infrastructure] MentorMap', () => {
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
        MentorRepositoryFactory,
        SequelizeProvider,
      ],
    }).compile();
    sequelize = module.get(SequelizeToken);
  });

  test('MentorMap.toEntity', async () => {
    // Safest way to unsure that the created http-handler is working as expected
    // is to create it in the database and then retrieve it

    const userRepository = sequelize.getRepository(UserEntity);
    const mentorRepository = sequelize.getRepository(MentorEntity);

    const mentorId = MentorId.create();

    // Settings
    const mentorSettings = new MentorSettings(mentorId, true, true, true, true, true, true, true);

    // User
    const role = Type.fromString('mentor');
    const user = User.create(UserId.create(), Email.fromString('john.doe@example.com'), role);

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

    const createMentorUsingEntity = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: auth0UserId.value };
      //@ts-expect-error avoid typing errors
      await userRepository.create(userJson, { transaction });

      const mentorEntity = MentorMap.toEntity(mentor, auth0UserId);

      await mentorEntity.save({ transaction });

      const mentorEntityFromDatabaseRaw = await mentorRepository.findByPk(mentor.id.value, { transaction });
      expect(mentorEntityFromDatabaseRaw).toBeDefined();

      const mentorEntityFromDatabase = mentorEntityFromDatabaseRaw.get({ plain: true });
      expect(mentorEntityFromDatabase).toBeDefined();

      expect(mentorEntityFromDatabase.mentor_id).toEqual(mentorId.value);
      expect(mentorEntityFromDatabase.user_id).toEqual(user.id.value);
      expect(mentorEntityFromDatabase.profile_description).toEqual(mentor.profileDescription);
      expect(mentorEntityFromDatabase.availability).toEqual(mentor.availability.value);
      expect(mentorEntityFromDatabase.languages.split(',')).toEqual(mentor.languages.map((language) => language.value));
      expect(mentorEntityFromDatabase.training_type.split(',')).toEqual(mentor.trainingType.map((tt) => tt.value));
    };

    await expect(runSequelizeTransaction(sequelize, createMentorUsingEntity)).rejects.toThrow('rollback');
  });

  test('MentorMap.toDomain', () => {
    // MentorMap.toDomain(mentor:MentorRaw): Result<Mentor,Error>
    const mentorId = MentorId.create();

    // Settings
    const mentorSettings = new MentorSettings(mentorId, true, true, true, true, true, true, true);

    // Professional professional-experience
    const professionalExperienceId = ProfessionalExperienceId.create();
    const period = Period.fromString(new Date(2018, 1, 1).toISOString(), new Date(2018, 12, 31).toISOString(), 'month');
    const professionalExperience = new ProfessionalExperience(
      professionalExperienceId,
      'Developer',
      'GreatCompany',
      period,
      mentorId,
    );

    // Pricing plan
    const pricingPlanId = PricingPlanId.create();
    const rate = Money.fromStringValues(100, 'EUR');
    const trainingType = TrainingType.fromString(TrainingType.Remote);
    const pricingType = PricingType.fromString(PricingType.Hourly);
    const pricingPlan = new PricingPlan(
      pricingPlanId,
      mentorId,
      rate,
      trainingType,
      pricingType,
      'Remote session - 1 hour',
    );

    // User
    const role = Type.fromString('mentor');
    const user = User.create(UserId.create(), Email.fromString('john.doe@example.com'), role);

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
      [professionalExperience],
      [pricingPlan],
      'Developer',
      'J.Doe',
    );

    const mentorRaw = MentorMap.toRaw(mentor);

    const mappedMentorResult = MentorMap.toDomain(mentorRaw);
    expect(mappedMentorResult.isOk()).toBeTruthy();
    const mappedMentor = mappedMentorResult._unsafeUnwrap();

    // Testing types
    expect(mappedMentor.id).toBeInstanceOf(MentorId);
    expect(mappedMentor.availability).toBeInstanceOf(Availability);
    expect(mappedMentor.languages.every((language) => language instanceof Language)).toBeTruthy();
    expect(mappedMentor.trainingType.every((trainingType) => trainingType instanceof TrainingType)).toBeTruthy();
    expect(mappedMentor.settings).toBeInstanceOf(MentorSettings);
    expect(mappedMentor.skills.every((skill) => skill instanceof Skill)).toBeTruthy();

    // Testing values or ids
    expect(
      mappedMentor.professionalExperiences.every(
        (professionalExperience) => professionalExperience instanceof ProfessionalExperience,
      ),
    ).toBeTruthy();

    expect(mappedMentor.id.value).toEqual(mentorId.value);
    expect(mappedMentor.user.id.value).toEqual(user.id.value);
    expect(mappedMentor.availability.value).toEqual(availability.value);
    expect(mappedMentor.settings).toEqual(mentorSettings);

    expect(mappedMentor.profileTitle).toEqual(mentor.profileTitle);
    expect(mappedMentor.profileDescription).toEqual(mentor.profileDescription);

    expect(mappedMentor.languages.map((language) => language.value)).toEqual(
      languages.map((language) => language.value),
    );

    expect(mappedMentor.trainingType.map((trainingType) => trainingType.value)).toEqual(
      mentor.trainingType.map((trainingType) => trainingType.value),
    );

    expect(mappedMentor.skills.map((skill) => skill.id)).toEqual(skills.map((skill) => skill.id));

    expect(
      mappedMentor.professionalExperiences.map((professionalExperience) => professionalExperience.id.value),
    ).toEqual(mentor.professionalExperiences.map((professionalExperience) => professionalExperience.id.value));

    expect(mappedMentor.pricingPlans.map((pricingPlan) => pricingPlan.id.value)).toEqual(
      mentor.pricingPlans.map((pricingPlan) => pricingPlan.id.value),
    );
  });

  test('MentorMap.toRaw', async () => {
    const mentorId = MentorId.create();

    // Settings
    const mentorSettings = new MentorSettings(mentorId, true, true, true, true, true, true, true);

    // Professional professional-experience
    const professionalExperienceId = ProfessionalExperienceId.create();
    const period = Period.fromString(new Date(2018, 1, 1).toISOString(), new Date(2018, 12, 31).toISOString(), 'month');
    const professionalExperience = new ProfessionalExperience(
      professionalExperienceId,
      'Developer',
      'GreatCompany',
      period,
      mentorId,
    );

    // Pricing plan
    const pricingPlanId = PricingPlanId.create();
    const rate = Money.fromStringValues(100, 'EUR');
    const trainingType = TrainingType.fromString(TrainingType.Remote);
    const pricingType = PricingType.fromString(PricingType.Hourly);
    const pricingPlan = new PricingPlan(
      pricingPlanId,
      mentorId,
      rate,
      trainingType,
      pricingType,
      'Remote session - 1 hour',
    );

    // User
    const role = Type.fromString('mentor');
    const user = User.create(UserId.create(), Email.fromString('john.doe@example.com'), role);

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
      [professionalExperience],
      [pricingPlan],
      'Developer',
      'J.Doe',
    );

    const mentorRawObject = MentorMap.toRaw(mentor);
    expect(typeof mentorRawObject.mentor_id === 'string').toBeTruthy();
    expect(typeof mentorRawObject.availability === 'string').toBeTruthy();
    expect(typeof mentorRawObject.profile_description === 'string').toBeTruthy();
    expect(typeof mentorRawObject.current_job === 'string').toBeTruthy();
    expect(typeof mentorRawObject.profile_title === 'string').toBeTruthy();
    expect(
      typeof mentorRawObject.languages === 'string' && mentorRawObject.languages.split(',').length === 2,
    ).toBeTruthy();
    expect(
      typeof mentorRawObject.training_type === 'string' && mentorRawObject.training_type.split(',').length === 2,
    ).toBeTruthy();

    expect(Array.isArray(mentorRawObject.skills)).toBeTruthy();
    expect(mentorRawObject.skills.length === 3).toBeTruthy();
    expect(Array.isArray(mentorRawObject.professional_experiences)).toBeTruthy();
    expect(mentorRawObject.professional_experiences.length === 1).toBeTruthy();
    expect(Array.isArray(mentorRawObject.pricing_plans)).toBeTruthy();
    expect(mentorRawObject.pricing_plans.length === 1).toBeTruthy();
  });
});
