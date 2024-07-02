import { Sequelize } from 'sequelize-typescript';
import { ConfigLoaderToken } from '../../../../src/infrastructure/init/token.init';
import { appConfig } from '../../../../../../config/autoload/app.config';
import { ConfigLoaderService } from '../../../../src/infrastructure/init/service/config-loader.service';
import { Test } from '@nestjs/testing';
import { SequelizeProvider } from '../../../../src/infrastructure/sequelize/sequelize.provider';
import { SequelizeToken } from '../../../../src/infrastructure/sequelize/token/sequelize.token';
import { MentorSettings as MentorSettingsEntity } from '../../../../../core/src/infrastructure/sequelize/entity/mentor-settings.entity';
import { Id as MentorId } from '../../../../../core/src/domain/mentor/id';
import { MentorSettingsMap } from '../../../../src/infrastructure/map/mentor-settings.map';
import { MentorSettings } from '../../../../src/domain/mentor-settings';
import { MentorSettings as MentorSettingsRaw } from '../../../../src/infrastructure/type/raw/mentor-settings.raw';
import { Mentor as MentorEntity } from '../../../../src/infrastructure/sequelize/entity/mentor.entity';
import { User as UserEntity } from '../../../../src/infrastructure/sequelize/entity/user.entity';
import { Id as UserId } from '../../../../src/domain/user/id';
import { Email } from '../../../../src/domain/user/email';
import { Type } from '../../../../src/domain/user/type';
import { Auth0UserId } from '../../../../src/infrastructure/resource/auth0/type/auth0-user-id';
import { User } from '../../../../src/domain/user';
import { Availability } from '../../../../src/domain/mentor/availability';
import { Language } from '../../../../src/domain/language';
import { Type as TrainingType } from '../../../../src/domain/training/type';
import { Mentor } from '../../../../src/domain/mentor';
import { Transaction } from 'sequelize';
import { runSequelizeTransaction } from '../../util';
import { UserMap } from '../../../../src/infrastructure/map/user.map';
import { MentorMap } from '../../../../src/infrastructure/map/mentor.map';

describe('[Core/Infrastructure] MentorSettingsMap', () => {
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

  test('MentorSettingsMap.toEntity', async () => {
    // Safest way to ensure that the created http-handler is working as expected
    // is to insert it into the database and then retrieve it.
    const mentorRepository = sequelize.getRepository(MentorEntity);
    const userRepository = sequelize.getRepository(UserEntity);

    // Create user
    const userId = UserId.create();
    const email = new Email('john.doe@example.com');
    const role = Type.fromString('mentor');
    const auth0UserId = new Auth0UserId('auth0|0123456789');

    const user = await new User(userId, email, role);

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

    const createMentorSettingsEntity = async (transaction: Transaction) => {
      const userJson = { ...UserMap.toJSON(user), auth0_id: auth0UserId.value };
      //@ts-expect-error avoid type error
      await userRepository.create(userJson, { transaction });

      const mentorRaw = { ...MentorMap.toRaw(mentor), user_id: userId.value };

      delete mentorRaw.settings;

      //@ts-expect-error avoid type error
      await mentorRepository.create(mentorRaw, { transaction });

      const mentorSettingsEntity = MentorSettingsMap.toEntity(mentorSettings);

      await mentorSettingsEntity.save({ transaction });

      const mentorSettingsEntityFromDatabase = await MentorSettingsEntity.findOne({
        where: { mentor_id: mentorId.value },
        transaction,
      });

      expect(mentorSettingsEntityFromDatabase).toBeDefined();

      const mentorSettingsFromDatabase = mentorSettingsEntityFromDatabase.get({ plain: true });

      expect(mentorSettingsFromDatabase).toBeDefined();
      expect(mentorSettingsFromDatabase.mentor_id).toEqual(mentorId.value);
    };

    await expect(runSequelizeTransaction(sequelize, createMentorSettingsEntity)).rejects.toThrow('rollback');
  });

  test('MentorSettingsMap.toDomain', () => {
    // MentorSettingsMap.toDomain(mentorSettings:MentorSettingsEntity): Result<MentorSettings,Error>
    const mentorSettingsRepository = sequelize.getRepository(MentorSettingsEntity);
    const mentorSettings = mentorSettingsRepository.build({
      mentor_id: MentorId.random(),
      display_nickname: 0,
      display_email: 1,
      display_phone_number: 1,
      display_location: 1,
      display_profile_photo: 1,
      display_current_job_title: 1,
      display_linkedin: 1,
    });

    const mappedMentorSettingsResult = MentorSettingsMap.toDomain(mentorSettings);
    expect(mappedMentorSettingsResult.isOk()).toBeTruthy();
    const mappedMentorSettings = mappedMentorSettingsResult._unsafeUnwrap();

    expect(mappedMentorSettingsResult.isOk()).toBeTruthy();
    expect(mappedMentorSettings.mentorId).toBeInstanceOf(MentorId);

    expect(typeof mappedMentorSettings.settingDisplayEmail === 'boolean').toBeTruthy();
    expect(typeof mappedMentorSettings.settingDisplayPhoneNumber === 'boolean').toBeTruthy();
    expect(typeof mappedMentorSettings.settingDisplayLocation === 'boolean').toBeTruthy();
    expect(typeof mappedMentorSettings.settingDisplayProfilePhoto === 'boolean').toBeTruthy();
    expect(typeof mappedMentorSettings.settingDisplayCurrentJobTitle === 'boolean').toBeTruthy();
    expect(typeof mappedMentorSettings.settingDisplayLinkedin === 'boolean').toBeTruthy();
    expect(typeof mappedMentorSettings.settingDisplayNickname === 'boolean').toBeTruthy();

    expect(mappedMentorSettings.settingDisplayEmail).toBe(true);
    expect(mappedMentorSettings.settingDisplayPhoneNumber).toBe(true);
    expect(mappedMentorSettings.settingDisplayLocation).toBe(true);
    expect(mappedMentorSettings.settingDisplayProfilePhoto).toBe(true);
    expect(mappedMentorSettings.settingDisplayCurrentJobTitle).toBe(true);
    expect(mappedMentorSettings.settingDisplayLinkedin).toBe(true);
    expect(mappedMentorSettings.settingDisplayNickname).toBe(false);

    // MentorSettingsMap.toDomain(mentorSettings:MentorSettingsRaw): Result<MentorSettings,Error>

    const mentorSettingsRaw: MentorSettingsRaw = {
      mentor_id: MentorId.random(),
      display_nickname: false,
      display_email: true,
      display_phone_number: true,
      display_location: true,
      display_profile_photo: true,
      display_current_job_title: true,
      display_linkedin: true,
    };

    const mappedMentorSettingsResult2 = MentorSettingsMap.toDomain(mentorSettingsRaw);
    expect(mappedMentorSettingsResult2.isOk()).toBeTruthy();

    const mappedMentorSettings2 = mappedMentorSettingsResult2._unsafeUnwrap();
    expect(mappedMentorSettings2.mentorId).toBeInstanceOf(MentorId);

    expect(typeof mappedMentorSettings2.settingDisplayEmail === 'boolean').toBeTruthy();
    expect(typeof mappedMentorSettings2.settingDisplayPhoneNumber === 'boolean').toBeTruthy();
    expect(typeof mappedMentorSettings2.settingDisplayLocation === 'boolean').toBeTruthy();
    expect(typeof mappedMentorSettings2.settingDisplayProfilePhoto === 'boolean').toBeTruthy();
    expect(typeof mappedMentorSettings2.settingDisplayCurrentJobTitle === 'boolean').toBeTruthy();
    expect(typeof mappedMentorSettings2.settingDisplayLinkedin === 'boolean').toBeTruthy();
    expect(typeof mappedMentorSettings2.settingDisplayNickname === 'boolean').toBeTruthy();

    expect(mappedMentorSettings2.settingDisplayEmail).toBe(true);
    expect(mappedMentorSettings2.settingDisplayPhoneNumber).toBe(true);
    expect(mappedMentorSettings2.settingDisplayLocation).toBe(true);
    expect(mappedMentorSettings2.settingDisplayProfilePhoto).toBe(true);
    expect(mappedMentorSettings2.settingDisplayCurrentJobTitle).toBe(true);
    expect(mappedMentorSettings2.settingDisplayLinkedin).toBe(true);
    expect(mappedMentorSettings2.settingDisplayNickname).toBe(false);
  });

  test('MentorSettingsMap.toRawObject', () => {
    const mentorSettings = new MentorSettings(MentorId.create(), true, true, true, true, true, true, true);
    const mappedMentorSettingsRaw = MentorSettingsMap.toRaw(mentorSettings);
    expect(typeof mappedMentorSettingsRaw.mentor_id === 'string').toBeTruthy();
    expect(typeof mappedMentorSettingsRaw.display_email === 'boolean').toBeTruthy();
    expect(typeof mappedMentorSettingsRaw.display_phone_number === 'boolean').toBeTruthy();
    expect(typeof mappedMentorSettingsRaw.display_location === 'boolean').toBeTruthy();
    expect(typeof mappedMentorSettingsRaw.display_profile_photo === 'boolean').toBeTruthy();
    expect(typeof mappedMentorSettingsRaw.display_current_job_title === 'boolean').toBeTruthy();
    expect(typeof mappedMentorSettingsRaw.display_linkedin === 'boolean').toBeTruthy();
    expect(typeof mappedMentorSettingsRaw.display_nickname === 'boolean').toBeTruthy();
  });
});
