import { Test } from '@nestjs/testing';
import { InMemoryMentorRepository } from '../../../../double/repository/in-memory-mentor.repository';
import { CreateMentorProfileHandler } from '../../../../../src/application/command/handler/create-mentor-profile.handler';
import { InMemoryUserRepository } from '../../../../double/repository/in-memory-user-repository';
import {
  MentorCollectionToken,
  SkillCollectionToken,
  UserCollectionToken,
} from '../../../../../src/infrastructure/repository/factory/token.factory';
import { InMemorySkillRepository } from '../../../../double/repository/in-memory-skill.repository';
import { User } from '../../../../../src/domain/user';
import { Id as UserId } from '../../../../../src/domain/user/id';
import { Email } from '../../../../../src/domain/user/email';
import { Mentor } from '../../../../../src/domain/mentor';
import { Id as MentorId } from '../../../../../src/domain/mentor/id';
import { Availability } from '../../../../../src/domain/mentor/availability';
import { Type as TrainingType } from '../../../../../src/domain/training/type';
import { Language } from '../../../../../src/domain/language';
import { MentorSettings } from '../../../../../src/domain/mentor-settings';
import { Skill } from '../../../../../src/domain/skill';
import { MentorCreationFailedException } from '../../../../../src/infrastructure/exception/mentor-creation-failed.exception';
import { Type } from '../../../../../src/domain/user/type';
import { CreateMentorProfileCommand } from '../../../../../src/application/command/create-mentor-profile.command';
import { RuntimeErrorException } from '../../../../../src/infrastructure/exception/runtime-error.exception';

describe('[Core/Application] CreateMentorHandler', () => {
  let createMentorProfileHandler: CreateMentorProfileHandler;
  let userRepository: InMemoryUserRepository;
  let mentorRepository: InMemoryMentorRepository;
  let skillRepository: InMemorySkillRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        CreateMentorProfileHandler,
        {
          provide: MentorCollectionToken,
          useClass: InMemoryMentorRepository,
        },
        {
          provide: UserCollectionToken,
          useClass: InMemoryUserRepository,
        },
        {
          provide: SkillCollectionToken,
          useClass: InMemorySkillRepository,
        },
      ],
    }).compile();

    createMentorProfileHandler = module.get(CreateMentorProfileHandler);
    userRepository = module.get(UserCollectionToken);
    mentorRepository = module.get(MentorCollectionToken);
    skillRepository = module.get(SkillCollectionToken);
  });

  beforeEach(() => {
    userRepository.clear();
    mentorRepository.clear();
    skillRepository.clear();
  });

  it('CreateMentorProfileHandler should be defined and instanced', () => {
    expect(createMentorProfileHandler).toBeDefined();
    expect(createMentorProfileHandler).toBeInstanceOf(CreateMentorProfileHandler);
  });

  it('UserRepository should be defined and instanced', () => {
    expect(userRepository).toBeDefined();
    expect(userRepository).toBeInstanceOf(InMemoryUserRepository);
  });

  it('MentorRepository should be defined and instanced', () => {
    expect(mentorRepository).toBeDefined();
    expect(mentorRepository).toBeInstanceOf(InMemoryMentorRepository);
  });

  it('SkillRepository should be defined and instanced', () => {
    expect(skillRepository).toBeDefined();
    expect(skillRepository).toBeInstanceOf(InMemorySkillRepository);
  });

  test('Create a new mentor profile', async () => {
    // 1. Create the user

    const user = User.create(UserId.create(), Email.fromString('bob.morris@example.com'), Type.fromString('mentor'));
    // 2. Create the mentor
    const mentorId = MentorId.create();
    const availability = Availability.fromString(Availability.Recurring);
    const trainingType = [TrainingType.fromString(TrainingType.Remote)];
    const languages = [Language.fromString('en')];
    const skills = [Skill.create('Java'), Skill.create('Spring')];
    const mentorSettings = new MentorSettings(mentorId, false, true, false, true, false, true, true);

    // Create mentor object domain
    const mentor = Mentor.create(
      mentorId,
      user,
      'profile description',
      availability,
      languages,
      trainingType,
      skills,
      mentorSettings,
    );

    // Create the command

    const registerMentorCommand = new CreateMentorProfileCommand(
      mentor.id.value,
      user.id.value,
      mentor.profileDescription,
      mentor.availability.value,
      mentor.languages.map((l) => l.value),
      mentor.trainingType.map((t) => t.value),
      mentor.profileTitle,
      mentor.currentJob,
      mentor.skills.map((skill) => skill.name),
      mentor.settings.settingDisplayNickname,
      mentor.settings.settingDisplayProfilePhoto,
      mentor.settings.settingDisplayLocation,
      mentor.settings.settingDisplayEmail,
      mentor.settings.settingDisplayPhoneNumber,
      mentor.settings.settingDisplayLinkedin,
      mentor.settings.settingDisplayCurrentJobTitle,
    );

    // Before creating the mentor, create the user.

    const mentorRepositoryCountBefore = mentorRepository.count();
    const userRepositoryCountBefore = userRepository.count();
    const skillRepositoryCountBefore = skillRepository.countSkill();

    const userAddResult = await userRepository.add(user);
    expect(userAddResult.isOk()).toBeTruthy();

    //  Register the mentor using the commmand handler

    await createMentorProfileHandler.execute(registerMentorCommand);

    await expect(createMentorProfileHandler.execute(registerMentorCommand)).rejects.toThrowError(
      MentorCreationFailedException,
    );

    // Check if the repositories has been updated
    const mentorRepositoryCountAfter = mentorRepository.count();
    const userRepositoryCountAfter = userRepository.count();
    const skillRepositoryCountAfter = skillRepository.countSkill();

    const mentorSkillCount = skillRepository.countMentorSkill(mentorId);

    expect(mentorSkillCount.isOk()).toBeTruthy();
    expect(mentorSkillCount._unsafeUnwrap()).toBe(2);

    expect(mentorRepositoryCountBefore + 1).toEqual(mentorRepositoryCountAfter);
    expect(userRepositoryCountBefore._unsafeUnwrap() + 1).toEqual(userRepositoryCountAfter);
    expect(skillRepositoryCountBefore + 2).toEqual(skillRepositoryCountAfter);

    const mentorFromRepository = await mentorRepository.get(mentorId);
    expect(mentorFromRepository.isOk()).toBeTruthy();
  });

  test('Try create a new mentor, but without registering first an user', async () => {
    // 1. Create the user

    const user = User.create(UserId.create(), Email.fromString('bob.morris@example.com'), Type.fromString('mentor'));
    // 2. Create the mentor
    const mentorId = MentorId.create();
    const availability = Availability.fromString(Availability.Recurring);
    const trainingType = [TrainingType.fromString(TrainingType.Remote)];
    const languages = [Language.fromString('en')];
    const skills = [Skill.create('Java'), Skill.create('Spring')];
    const mentorSettings = new MentorSettings(mentorId, false, true, false, true, false, true, true);

    // Create mentor object domain
    const mentor = Mentor.create(
      mentorId,
      user,
      'profile description',
      availability,
      languages,
      trainingType,
      skills,
      mentorSettings,
    );

    // Create the command

    const registerMentorCommand = new CreateMentorProfileCommand(
      mentor.id.value,
      user.id.value,
      mentor.profileDescription,
      mentor.availability.value,
      mentor.languages.map((l) => l.value),
      mentor.trainingType.map((t) => t.value),
      mentor.profileTitle,
      mentor.currentJob,
      mentor.skills.map((skill) => skill.name),
      mentor.settings.settingDisplayNickname,
      mentor.settings.settingDisplayProfilePhoto,
      mentor.settings.settingDisplayLocation,
      mentor.settings.settingDisplayEmail,
      mentor.settings.settingDisplayPhoneNumber,
      mentor.settings.settingDisplayLinkedin,
      mentor.settings.settingDisplayCurrentJobTitle,
    );

    //  Register the mentor using the commmand handler
    await expect(createMentorProfileHandler.execute(registerMentorCommand)).rejects.toThrowError(RuntimeErrorException);
  });
});
