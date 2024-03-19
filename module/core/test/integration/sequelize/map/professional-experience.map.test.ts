import { appConfig } from '../../../../../../config/autoload/app.config';
import { Test } from '@nestjs/testing';
import { SequelizeProvider } from '../../../../src/infrastructure/sequelize/sequelize.provider';
import { Sequelize } from 'sequelize-typescript';
import { SequelizeToken } from '../../../../src/infrastructure/sequelize/token/sequelize.token';
import { ProfessionalExperienceRepositoryFactory } from '../../../../src/infrastructure/repository/factory/professional-experience.repository.factory';
import { ProfessionalExperience as ProfessionalExperienceEntity } from '../../../../src/infrastructure/sequelize/entity/professional-experience.entity';
import { Id as ProfessionalExperienceId } from '../../../../src/domain/professional-experience/id';
import { Id as MentorId } from '../../../../src/domain/mentor/id';
import { ProfessionalExperienceMap } from '../../../../src/infrastructure/map/professional-experience.map';
import { Period } from '../../../../src/domain/professional-experience/period';
import { ProfessionalExperience } from '../../../../src/domain/professional-experience';
import { ConfigLoaderToken } from '../../../../src/infrastructure/init/token.init';
import { ConfigLoaderService } from '../../../../src/infrastructure/init/service/config-loader.service';
import { Datetime } from '../../../../src/infrastructure/type/datetime.type';
import { ProfessionalExperience as ProfessionalExperienceRaw } from '../../../../src/infrastructure/type/raw/professional-experience.raw';
import { Mentor as MentorEntity } from '../../../../src/infrastructure/sequelize/entity/mentor.entity';
import { User as UserEntity } from '../../../../src/infrastructure/sequelize/entity/user.entity';
import { Transaction } from 'sequelize';
import { runSequelizeTransaction } from '../../util';
import { Id as UserId } from '../../../../src/domain/user/id';
import { Email } from '../../../../src/domain/user/email';
import { Type } from '../../../../src/domain/user/type';
import { Auth0UserId } from '../../../../src/infrastructure/resource/auth0/type/auth0-user-id';
import { User } from '../../../../src/domain/user';
import { Availability } from '../../../../src/domain/mentor/availability';
import { Language } from '../../../../src/domain/language';
import { Type as TrainingType } from '../../../../src/domain/training/type';
import { MentorSettings } from '../../../../src/domain/mentor-settings';
import { Mentor } from '../../../../src/domain/mentor';
import { UserMap } from '../../../../src/infrastructure/map/user.map';
import { MentorMap } from '../../../../src/infrastructure/map/mentor.map';
describe('[Core/Infrastructure] ProfessionalExperienceMap', () => {
  let sequelize: Sequelize;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        ProfessionalExperienceRepositoryFactory,
        SequelizeProvider,
        {
          provide: ConfigLoaderToken,
          useFactory: () => {
            const config = appConfig();
            return new ConfigLoaderService(config);
          },
        },
      ],
    }).compile();

    sequelize = module.get(SequelizeToken);
  });

  it('Sequelize should be defined', () => {
    expect(sequelize).toBeDefined();
    expect(sequelize).toBeInstanceOf(Sequelize);
  });

  test('ProfessionalExperienceMap.toEntity', async () => {
    // Safest way to ensure that ProfessionalExperienceMap.toEntity is working as expected is to create it and try to retrieve it from the database.
    const mentorRepository = sequelize.getRepository(MentorEntity);
    const userRepository = sequelize.getRepository(UserEntity);
    const professionalExperienceRepository = sequelize.getRepository(ProfessionalExperienceEntity);

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

    const professionalExperienceId = ProfessionalExperienceId.create();
    const period = Period.fromString(new Date(2018, 1, 1).toISOString(), new Date(2019, 5, 25).toISOString(), 'month');
    const professionalExperience = new ProfessionalExperience(
      professionalExperienceId,
      'GreatCompany',
      'Developer',
      period,
      mentorId,
    );

    const createProfessionalExperienceUsingEntity = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: auth0UserId.value };
      //@ts-expect-error avoid type error
      await userRepository.create(userJson, { transaction });

      const mentorRaw = { ...MentorMap.toRaw(mentor), user_id: userId.value };

      //@ts-expect-error avoid type error
      await mentorRepository.create(mentorRaw, { transaction });

      const professionalExperienceEntity = ProfessionalExperienceMap.toEntity(professionalExperience);
      await professionalExperienceEntity.save({ transaction });

      const professionalExperienceRawFromDatabase = await professionalExperienceRepository.findByPk(
        professionalExperience.id.value,
        {
          transaction,
        },
      );

      expect(professionalExperienceRawFromDatabase).toBeDefined();

      const professionalExperienceFromDatabase = professionalExperienceRawFromDatabase.get({ plain: true });

      expect(professionalExperienceFromDatabase.professional_experience_id).toBe(professionalExperienceId.value);
      expect(professionalExperienceFromDatabase.company).toBe(professionalExperience.company);
      expect(professionalExperienceFromDatabase.job_title).toBe(professionalExperience.jobTitle);
      expect(professionalExperienceFromDatabase.start_date.toISOString()).toBe(
        professionalExperience.period.startDate.value,
      );
      expect(professionalExperienceFromDatabase.end_date.toISOString()).toBe(
        professionalExperience.period.endDate.value,
      );
    };

    await expect(runSequelizeTransaction(sequelize, createProfessionalExperienceUsingEntity)).rejects.toThrow(
      'rollback',
    );
  });

  test('ProfessionalExperienceMap.toDomain', () => {
    // ProfessionalExperienceMap.toDomain(experience:ProfessionalExperienceEntity): Result<ProfessionalExperience,Error>

    const professionalExperience = new ProfessionalExperienceEntity();

    professionalExperience.professional_experience_id = ProfessionalExperienceId.create().value;
    professionalExperience.company = 'GreatCompany';
    professionalExperience.job_title = 'Developer';
    professionalExperience.start_date = new Date(2018, 1, 1);
    professionalExperience.end_date = new Date(2019, 5, 25);
    professionalExperience.mentor_id = MentorId.create().value;

    const mappedProfessionalExperienceResult = ProfessionalExperienceMap.toDomain(professionalExperience);
    const mappedProfessionalExperience = mappedProfessionalExperienceResult._unsafeUnwrap();
    expect(mappedProfessionalExperience.id).toBeInstanceOf(ProfessionalExperienceId);
    expect(mappedProfessionalExperience.period).toBeInstanceOf(Period);
    expect(mappedProfessionalExperience.period.startDate).toBeInstanceOf(Datetime);
    expect(mappedProfessionalExperience.period.endDate).toBeInstanceOf(Datetime);
    expect(mappedProfessionalExperience.mentorId).toBeInstanceOf(MentorId);

    expect(mappedProfessionalExperience.id.value).toBe(professionalExperience.professional_experience_id);

    expect(mappedProfessionalExperience.mentorId.value).toBe(professionalExperience.mentor_id);
    expect(mappedProfessionalExperience.company).toBe(professionalExperience.company);
    expect(mappedProfessionalExperience.jobTitle).toBe(professionalExperience.job_title);
    expect(mappedProfessionalExperience.period.startDate.value).toEqual(
      professionalExperience.start_date.toISOString(),
    );

    // We're not testing the end date here because, dates are transformed to a Period object, and the end date
    // will be set to the end of the month.

    // ProfessionalExperienceMap.toDomain(experience:ProfessionalExperienceRaw): Result<ProfessionalExperience,Error>
    const rawProfessionalExperience: ProfessionalExperienceRaw = {
      professional_experience_id: ProfessionalExperienceId.random(),
      mentor_id: MentorId.random(),
      company: 'GreatCompany',
      job_title: 'Developer',
      start_date: new Date(2018, 1, 1).toISOString(),
      end_date: new Date(2019, 5, 25).toISOString(),
    };

    const mappedRawProfessionalExperienceResult = ProfessionalExperienceMap.toDomain(rawProfessionalExperience);
    const mappedRawProfessionalExperience = mappedRawProfessionalExperienceResult._unsafeUnwrap();
    expect(mappedRawProfessionalExperience.id).toBeInstanceOf(ProfessionalExperienceId);
    expect(mappedRawProfessionalExperience.period).toBeInstanceOf(Period);
    expect(mappedRawProfessionalExperience.mentorId).toBeInstanceOf(MentorId);
    expect(mappedRawProfessionalExperience.id.value).toBe(rawProfessionalExperience.professional_experience_id);
    expect(mappedRawProfessionalExperience.mentorId.value).toBe(rawProfessionalExperience.mentor_id);
    expect(mappedRawProfessionalExperience.company).toBe(rawProfessionalExperience.company);
    expect(mappedRawProfessionalExperience.jobTitle).toBe(rawProfessionalExperience.job_title);
  });

  test('ProfessionalExperienceMap.toRawObject', () => {
    const mentorId = MentorId.create();
    const professionalExperienceId = ProfessionalExperienceId.create();
    const period = Period.fromString(new Date(2018, 1, 1).toISOString(), new Date(2019, 5, 25).toISOString(), 'month');
    const professionalExperience = new ProfessionalExperience(
      professionalExperienceId,
      'GreatCompany',
      'Developer',
      period,
      mentorId,
    );

    const professionalExperienceRawObject = ProfessionalExperienceMap.toRaw(professionalExperience);
    expect(professionalExperienceRawObject.professional_experience_id).toBe(professionalExperienceId.value);
    expect(professionalExperienceRawObject.company).toBe(professionalExperience.company);
    expect(professionalExperienceRawObject.job_title).toBe(professionalExperience.jobTitle);
    expect(professionalExperienceRawObject.start_date).toBe(period.startDate.value);
    expect(professionalExperienceRawObject.end_date).toBe(period.endDate.value);
    expect(professionalExperienceRawObject.mentor_id).toBe(mentorId.value);
  });
});
