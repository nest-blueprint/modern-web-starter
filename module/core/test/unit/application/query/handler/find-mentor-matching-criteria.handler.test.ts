import { InMemoryMentorRepository } from '../../../../double/repository/in-memory-mentor.repository';
import { FindMentorMatchingCriteriaHandler } from '../../../../../src/application/query/handler/find-mentor-matching-criteria.handler';
import { Test } from '@nestjs/testing';
import {
  MentorCollectionToken,
  SkillCollectionToken,
} from '../../../../../src/infrastructure/repository/factory/token.factory';
import { Id as MentorId } from '../../../../../src/domain/mentor/id';
import { Type } from '../../../../../src/domain/user/type';
import { User } from '../../../../../src/domain/user';
import { Id as UserId } from '../../../../../src/domain/user/id';
import { Email } from '../../../../../src/domain/user/email';
import { Availability } from '../../../../../src/domain/mentor/availability';
import { Language } from '../../../../../src/domain/language';
import { Type as TrainingType } from '../../../../../src/domain/training/type';
import { MentorSettings } from '../../../../../src/domain/mentor-settings';
import { Mentor } from '../../../../../src/domain/mentor';
import { Skill } from '../../../../../src/domain/skill';
import { FindMentorMatchingCriteriaQuery } from '../../../../../src/application/query/find-mentor-matching-criteria.query';
import { Money } from '../../../../../src/domain/money';
import { Type as PricingType } from '../../../../../src/domain/pricing/type';
import { Id as PricingPlanId } from '../../../../../src/domain/pricing-plan/id';
import { PricingPlan } from '../../../../../src/domain/pricing-plan';
import { InMemorySkillRepository } from '../../../../double/repository/in-memory-skill.repository';

describe('[Core/Application] FindMentorMatchingCriteriaHandler', () => {
  let mentorRepository: InMemoryMentorRepository;
  let skillRepository: InMemorySkillRepository;
  let findMentorMatchingCriteriaHandler: FindMentorMatchingCriteriaHandler;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        FindMentorMatchingCriteriaHandler,
        { provide: MentorCollectionToken, useClass: InMemoryMentorRepository },
        { provide: SkillCollectionToken, useClass: InMemorySkillRepository },
      ],
    }).compile();

    findMentorMatchingCriteriaHandler = module.get(FindMentorMatchingCriteriaHandler);
    mentorRepository = module.get(MentorCollectionToken);
    skillRepository = module.get(SkillCollectionToken);
  });

  it('FindMentorMatchingCriteriaHandler should be defined and instanced', () => {
    expect(findMentorMatchingCriteriaHandler).toBeDefined();
    expect(findMentorMatchingCriteriaHandler instanceof FindMentorMatchingCriteriaHandler).toBeTruthy();
  });

  it('MentorRepository should be defined and instanced', () => {
    expect(mentorRepository).toBeDefined();
    expect(mentorRepository instanceof InMemoryMentorRepository).toBeTruthy();
  });

  test('Should return all mentors', async () => {
    // Create skills and save them before creating mentors
    const javaSkill = Skill.create('Java');
    const phpSkill = Skill.create('PHP');
    const pythonSkill = Skill.create('Python');
    const javascriptSkill = Skill.create('Javascript');

    skillRepository.add(javaSkill);
    skillRepository.add(phpSkill);
    skillRepository.add(pythonSkill);
    skillRepository.add(javascriptSkill);

    const mentorId = MentorId.create();
    const role = new Type('mentor');

    const user = User.create(UserId.create(), Email.fromString('john.doe@example.com'), role);
    const profileDescription = 'profile';
    const availability = Availability.fromString('full_time');
    const languages = [Language.fromString('en')];
    const trainingTypes = [TrainingType.fromString('remote')];
    const settings = new MentorSettings(mentorId, true, true, true, true, true, true, true);
    const mentor = Mentor.create(
      mentorId,
      user,
      profileDescription,
      availability,
      languages,
      trainingTypes,
      [javaSkill, pythonSkill],
      settings,
    );

    mentorRepository.add(mentor);

    const mentorId2 = MentorId.create();
    const role2 = new Type('mentor');

    const user2 = User.create(UserId.create(), Email.fromString('alice.smith@example.com'), role2);
    const profileDescription2 = 'Alice Smith';
    const availability2 = Availability.fromString('full_time');
    const languages2 = [Language.fromString('fr')];
    const trainingTypes2 = [TrainingType.fromString('face_to_face')];
    const settings2 = new MentorSettings(mentorId2, true, true, true, true, true, true, true);
    const mentor2 = Mentor.create(
      mentorId2,
      user2,
      profileDescription2,
      availability2,
      languages2,
      trainingTypes2,
      [phpSkill, javascriptSkill],
      settings2,
    );

    mentorRepository.add(mentor2);

    expect(mentorRepository.count()).toBe(2);

    const findMentorMatchingCriteriaQuery = new FindMentorMatchingCriteriaQuery([mentorId.value, mentorId2.value]);

    const mentors = await findMentorMatchingCriteriaHandler.execute(findMentorMatchingCriteriaQuery);

    expect(mentors).toHaveLength(2);
  });

  test('Should return only mentors matching availability type', async () => {
    // Create skills and save them before creating mentors
    const javaSkill = Skill.create('Java');
    const phpSkill = Skill.create('PHP');
    const pythonSkill = Skill.create('Python');
    const javascriptSkill = Skill.create('Javascript');

    skillRepository.add(javaSkill);
    skillRepository.add(phpSkill);
    skillRepository.add(pythonSkill);
    skillRepository.add(javascriptSkill);

    const requestedAvailability = Availability.fromString('full_time');
    const mentorId = MentorId.create();
    const role = new Type('mentor');

    const user = User.create(UserId.create(), Email.fromString('john.doe@example.com'), role);
    const profileDescription = 'profile';
    const availability = Availability.fromString('full_time');
    const languages = [Language.fromString('en')];
    const trainingTypes = [TrainingType.fromString('remote')];
    const settings = new MentorSettings(mentorId, true, true, true, true, true, true, true);
    const mentor = Mentor.create(
      mentorId,
      user,
      profileDescription,
      availability,
      languages,
      trainingTypes,
      [javaSkill, pythonSkill],
      settings,
    );

    mentorRepository.add(mentor);

    const mentorId2 = MentorId.create();
    const role2 = new Type('mentor');

    const user2 = User.create(UserId.create(), Email.fromString('alice.smith@example.com'), role2);
    const profileDescription2 = 'Alice Smith';
    const availability2 = Availability.fromString('one_time');
    const languages2 = [Language.fromString('fr')];
    const trainingTypes2 = [TrainingType.fromString('face_to_face')];
    const settings2 = new MentorSettings(mentorId2, true, true, true, true, true, true, true);
    const mentor2 = Mentor.create(
      mentorId2,
      user2,
      profileDescription2,
      availability2,
      languages2,
      trainingTypes2,
      [phpSkill, javascriptSkill],
      settings2,
    );

    mentorRepository.add(mentor2);

    expect(mentorRepository.count()).toBe(2);

    const findMentorMatchingCriteriaQuery = new FindMentorMatchingCriteriaQuery(
      [mentorId.value, mentorId2.value],
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      requestedAvailability.value,
    );

    const findMentorMatchingCriteriaQuery2 = new FindMentorMatchingCriteriaQuery(
      [mentorId.value, mentorId2.value],
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      Availability.fromString('recurring').value,
    );

    const result1 = await findMentorMatchingCriteriaHandler.execute(findMentorMatchingCriteriaQuery);
    const result2 = await findMentorMatchingCriteriaHandler.execute(findMentorMatchingCriteriaQuery2);

    expect(result1).toHaveLength(1);
    expect(result2).toHaveLength(0);
  });

  test('Should return only mentors matching language', async () => {
    // Create skills and save them before creating mentors
    const javaSkill = Skill.create('Java');
    const phpSkill = Skill.create('PHP');
    const pythonSkill = Skill.create('Python');
    const javascriptSkill = Skill.create('Javascript');

    skillRepository.add(javaSkill);
    skillRepository.add(phpSkill);
    skillRepository.add(pythonSkill);
    skillRepository.add(javascriptSkill);

    const mentorId = MentorId.create();
    const role = new Type('mentor');

    const user = User.create(UserId.create(), Email.fromString('john.doe@example.com'), role);
    const profileDescription = 'profile';
    const availability = Availability.fromString('full_time');
    const languages = [Language.fromString('en')];
    const trainingTypes = [TrainingType.fromString('remote')];
    const settings = new MentorSettings(mentorId, true, true, true, true, true, true, true);
    const mentor = Mentor.create(
      mentorId,
      user,
      profileDescription,
      availability,
      languages,
      trainingTypes,
      [javaSkill, pythonSkill],
      settings,
    );

    mentorRepository.add(mentor);

    const mentorId2 = MentorId.create();
    const role2 = new Type('mentor');

    const user2 = User.create(UserId.create(), Email.fromString('alice.smith@example.com'), role2);
    const profileDescription2 = 'Alice Smith';
    const availability2 = Availability.fromString('one_time');
    const languages2 = [Language.fromString('fr')];
    const trainingTypes2 = [TrainingType.fromString('face_to_face')];
    const settings2 = new MentorSettings(mentorId2, true, true, true, true, true, true, true);
    const mentor2 = Mentor.create(
      mentorId2,
      user2,
      profileDescription2,
      availability2,
      languages2,
      trainingTypes2,
      [phpSkill, javascriptSkill],
      settings2,
    );

    mentorRepository.add(mentor2);

    expect(mentorRepository.count()).toBe(2);

    const findMentorMatchingCriteriaQuery = new FindMentorMatchingCriteriaQuery(
      [mentorId.value, mentorId2.value],
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      [Language.fromString('en').value],
    );

    const mentors = await findMentorMatchingCriteriaHandler.execute(findMentorMatchingCriteriaQuery);

    expect(mentors).toHaveLength(1);
  });

  test('Should return only mentors matching training type', async () => {
    // Create skills and save them before creating mentors
    const javaSkill = Skill.create('Java');
    const phpSkill = Skill.create('PHP');
    const pythonSkill = Skill.create('Python');
    const javascriptSkill = Skill.create('Javascript');

    skillRepository.add(javaSkill);
    skillRepository.add(phpSkill);
    skillRepository.add(pythonSkill);
    skillRepository.add(javascriptSkill);

    const mentorId = MentorId.create();
    const role = new Type('mentor');

    const user = User.create(UserId.create(), Email.fromString('john.doe@example.com'), role);
    const profileDescription = 'profile';
    const availability = Availability.fromString('full_time');
    const languages = [Language.fromString('en')];
    const trainingTypes = [TrainingType.fromString('remote')];
    const settings = new MentorSettings(mentorId, true, true, true, true, true, true, true);
    const mentor = Mentor.create(
      mentorId,
      user,
      profileDescription,
      availability,
      languages,
      trainingTypes,
      [javaSkill, pythonSkill],
      settings,
    );

    mentorRepository.add(mentor);

    const mentorId2 = MentorId.create();
    const role2 = new Type('mentor');

    const user2 = User.create(UserId.create(), Email.fromString('alice.smith@example.com'), role2);
    const profileDescription2 = 'Alice Smith';
    const availability2 = Availability.fromString('one_time');
    const languages2 = [Language.fromString('fr')];
    const trainingTypes2 = [TrainingType.fromString('face_to_face')];
    const settings2 = new MentorSettings(mentorId2, true, true, true, true, true, true, true);
    const mentor2 = Mentor.create(
      mentorId2,
      user2,
      profileDescription2,
      availability2,
      languages2,
      trainingTypes2,
      [phpSkill, javascriptSkill],
      settings2,
    );

    mentorRepository.add(mentor2);

    const mentorId3 = MentorId.create();
    const role3 = new Type('mentor');

    const user3 = User.create(UserId.create(), Email.fromString('bob.dylan@example.com'), role3);
    const profileDescription3 = 'Bob Dylan';
    const availability3 = Availability.fromString('one_time');
    const languages3 = [Language.fromString('fr')];
    const trainingTypes3 = [TrainingType.fromString('face_to_face')];
    const settings3 = new MentorSettings(mentorId3, true, true, true, true, true, true, true);
    const mentor3 = Mentor.create(
      mentorId3,
      user3,
      profileDescription3,
      availability3,
      languages3,
      trainingTypes3,
      [pythonSkill],
      settings3,
    );

    mentorRepository.add(mentor3);

    expect(mentorRepository.count()).toBe(3);

    const findMentorMatchingCriteriaQuery = new FindMentorMatchingCriteriaQuery(
      [mentorId.value, mentorId2.value, mentorId3.value],
      undefined,
      undefined,
      undefined,
      undefined,
      [TrainingType.FaceToFace],
    );

    const findMentorMatchingCriteriaQuery2 = new FindMentorMatchingCriteriaQuery(
      [mentorId.value, mentorId2.value, mentorId3.value],
      undefined,
      undefined,
      undefined,
      undefined,
      [TrainingType.Remote],
    );

    const results = await findMentorMatchingCriteriaHandler.execute(findMentorMatchingCriteriaQuery);

    const results2 = await findMentorMatchingCriteriaHandler.execute(findMentorMatchingCriteriaQuery2);

    expect(results).toHaveLength(2);

    expect(results2).toHaveLength(1);
  });

  test('Should return only mentors matching over the minimum price', async () => {
    // Create skills and save them before creating mentors
    const javaSkill = Skill.create('Java');
    const phpSkill = Skill.create('PHP');
    const pythonSkill = Skill.create('Python');
    const javascriptSkill = Skill.create('Javascript');

    skillRepository.add(javaSkill);
    skillRepository.add(phpSkill);
    skillRepository.add(pythonSkill);
    skillRepository.add(javascriptSkill);

    // Pricing plan

    const mentorId = MentorId.create();

    const rate = Money.fromStringValues(100, 'EUR');
    const pricingType = PricingType.fromString('hourly');
    const trainingType = TrainingType.fromString('remote');
    const pricingPlanId = PricingPlanId.create();
    const pricingPlan = new PricingPlan(pricingPlanId, mentorId, rate, trainingType, pricingType, 'Remote session');

    // Mentor 1
    const role = new Type('mentor');
    const user = User.create(UserId.create(), Email.fromString('john.doe@example.com'), role);
    const profileDescription = 'profile';
    const availability = Availability.fromString('full_time');
    const languages = [Language.fromString('en')];
    const trainingTypes = [TrainingType.fromString('remote')];
    const settings = new MentorSettings(mentorId, true, true, true, true, true, true, true);
    const mentor = new Mentor(
      mentorId,
      user,
      profileDescription,
      availability,
      languages,
      trainingTypes,
      settings,
      [javaSkill, pythonSkill],
      [],
      [pricingPlan],
    );

    // Mentor 2
    const mentorId2 = MentorId.create();
    // Pricing plan
    const rate2 = Money.fromStringValues(40, 'EUR');
    const pricingType2 = PricingType.fromString('hourly');
    const trainingType2 = TrainingType.fromString('remote');
    const pricingPlanId2 = PricingPlanId.create();
    const pricingPlan2 = new PricingPlan(
      pricingPlanId2,
      mentorId2,
      rate2,
      trainingType2,
      pricingType2,
      'Remote session',
    );

    const role2 = new Type('mentor');
    const user2 = User.create(UserId.create(), Email.fromString('john.doe@example.com'), role2);
    const profileDescription2 = 'profile';
    const availability2 = Availability.fromString('full_time');
    const languages2 = [Language.fromString('en')];
    const trainingTypes2 = [TrainingType.fromString('remote')];
    const settings2 = new MentorSettings(mentorId2, true, true, true, true, true, true, true);
    const mentor2 = new Mentor(
      mentorId2,
      user2,
      profileDescription2,
      availability2,
      languages2,
      trainingTypes2,
      settings2,
      [javaSkill, pythonSkill],
      [],
      [pricingPlan2],
    );

    mentorRepository.add(mentor);
    mentorRepository.add(mentor2);

    expect(mentorRepository.count()).toBe(2);

    const findMentorMatchingCriteriaQuery = new FindMentorMatchingCriteriaQuery(
      [mentorId.value, mentorId2.value],
      undefined,
      50,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );

    const findMentorMatchingCriteriaQuery2 = new FindMentorMatchingCriteriaQuery(
      [mentorId.value, mentorId2.value],
      undefined,
      200,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );

    const results = await findMentorMatchingCriteriaHandler.execute(findMentorMatchingCriteriaQuery);
    const result2 = await findMentorMatchingCriteriaHandler.execute(findMentorMatchingCriteriaQuery2);

    expect(results).toHaveLength(1);
    expect(result2).toHaveLength(0);
  });

  test('Should return only mentors matching under the maximum price', async () => {
    // Create skills and save them before creating mentors
    const javaSkill = Skill.create('Java');
    const phpSkill = Skill.create('PHP');
    const pythonSkill = Skill.create('Python');
    const javascriptSkill = Skill.create('Javascript');

    skillRepository.add(javaSkill);
    skillRepository.add(phpSkill);
    skillRepository.add(pythonSkill);
    skillRepository.add(javascriptSkill);

    // Pricing plan

    const mentorId = MentorId.create();

    const rate = Money.fromStringValues(200, 'EUR');
    const pricingType = PricingType.fromString('hourly');
    const trainingType = TrainingType.fromString('remote');
    const pricingPlanId = PricingPlanId.create();
    const pricingPlan = new PricingPlan(pricingPlanId, mentorId, rate, trainingType, pricingType, 'Remote session');

    // Mentor 1
    const role = new Type('mentor');
    const user = User.create(UserId.create(), Email.fromString('john.doe@example.com'), role);
    const profileDescription = 'profile';
    const availability = Availability.fromString('full_time');
    const languages = [Language.fromString('en')];
    const trainingTypes = [TrainingType.fromString('remote')];
    const settings = new MentorSettings(mentorId, true, true, true, true, true, true, true);
    const mentor = new Mentor(
      mentorId,
      user,
      profileDescription,
      availability,
      languages,
      trainingTypes,
      settings,
      [javaSkill, pythonSkill],
      [],
      [pricingPlan],
    );

    // Mentor 2
    const mentorId2 = MentorId.create();
    // Pricing plan
    const rate2 = Money.fromStringValues(40, 'EUR');
    const pricingType2 = PricingType.fromString('hourly');
    const trainingType2 = TrainingType.fromString('remote');
    const pricingPlanId2 = PricingPlanId.create();
    const pricingPlan2 = new PricingPlan(
      pricingPlanId2,
      mentorId2,
      rate2,
      trainingType2,
      pricingType2,
      'Remote session',
    );

    const role2 = new Type('mentor');
    const user2 = User.create(UserId.create(), Email.fromString('john.doe@example.com'), role2);
    const profileDescription2 = 'profile';
    const availability2 = Availability.fromString('full_time');
    const languages2 = [Language.fromString('en')];
    const trainingTypes2 = [TrainingType.fromString('remote')];
    const settings2 = new MentorSettings(mentorId2, true, true, true, true, true, true, true);
    const mentor2 = new Mentor(
      mentorId2,
      user2,
      profileDescription2,
      availability2,
      languages2,
      trainingTypes2,
      settings2,
      [javaSkill, pythonSkill],
      [],
      [pricingPlan2],
    );

    mentorRepository.add(mentor);
    mentorRepository.add(mentor2);

    expect(mentorRepository.count()).toBe(2);

    const findMentorMatchingCriteriaQuery = new FindMentorMatchingCriteriaQuery(
      [mentorId.value, mentorId2.value],
      100,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );

    const findMentorMatchingCriteriaQuery2 = new FindMentorMatchingCriteriaQuery(
      [mentorId.value, mentorId2.value],
      300,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );

    const results = await findMentorMatchingCriteriaHandler.execute(findMentorMatchingCriteriaQuery);
    const result2 = await findMentorMatchingCriteriaHandler.execute(findMentorMatchingCriteriaQuery2);

    expect(results).toHaveLength(1);
    expect(result2).toHaveLength(2);
  });

  test('Should return only mentor matching skills', async () => {
    // Create skills and save them before creating mentors
    const javaSkill = Skill.create('Java');
    const phpSkill = Skill.create('PHP');
    const pythonSkill = Skill.create('Python');
    const javascriptSkill = Skill.create('Javascript');
    const rustSkill = Skill.create('Rust');

    skillRepository.add(javaSkill);
    skillRepository.add(phpSkill);
    skillRepository.add(pythonSkill);
    skillRepository.add(javascriptSkill);
    skillRepository.add(rustSkill);

    const mentorId = MentorId.create();
    const role = new Type('mentor');

    const user = User.create(UserId.create(), Email.fromString('john.doe@example.com'), role);
    const profileDescription = 'profile';
    const availability = Availability.fromString('full_time');
    const languages = [Language.fromString('en')];
    const trainingTypes = [TrainingType.fromString('face_to_face')];
    const settings = new MentorSettings(mentorId, true, true, true, true, true, true, true);
    const mentor = Mentor.create(
      mentorId,
      user,
      profileDescription,
      availability,
      languages,
      trainingTypes,
      [javaSkill, pythonSkill],
      settings,
    );

    mentorRepository.add(mentor);

    const updateMentorSkillsResult = skillRepository.setMentorSkills(mentorId, [javaSkill, pythonSkill]);
    expect(updateMentorSkillsResult.isOk()).toBeTruthy();

    const mentorId2 = MentorId.create();
    const role2 = new Type('mentor');

    const user2 = User.create(UserId.create(), Email.fromString('alice.smith@example.com'), role2);
    const profileDescription2 = 'Alice Smith';
    const availability2 = Availability.fromString('one_time');
    const languages2 = [Language.fromString('fr')];
    const trainingTypes2 = [TrainingType.fromString('face_to_face')];
    const settings2 = new MentorSettings(mentorId2, true, true, true, true, true, true, true);
    const mentor2 = Mentor.create(
      mentorId2,
      user2,
      profileDescription2,
      availability2,
      languages2,
      trainingTypes2,
      [phpSkill, javascriptSkill],
      settings2,
    );

    mentorRepository.add(mentor2);
    const updateMentorSkillsResult2 = skillRepository.setMentorSkills(mentorId2, [phpSkill, javascriptSkill]);
    expect(updateMentorSkillsResult2.isOk()).toBeTruthy();

    expect(mentorRepository.count()).toBe(2);

    const findMentorMatchingCriteriaQuery = new FindMentorMatchingCriteriaQuery(
      [mentorId.value, mentorId2.value],
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      ['Java', 'Python'],
    );

    const findMentorMatchingCriteriaQuery2 = new FindMentorMatchingCriteriaQuery(
      [mentorId.value, mentorId2.value],
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      ['Java', 'Python', 'Rust'],
    );

    const results = await findMentorMatchingCriteriaHandler.execute(findMentorMatchingCriteriaQuery);
    const results2 = await findMentorMatchingCriteriaHandler.execute(findMentorMatchingCriteriaQuery2);

    expect(results).toHaveLength(1);
    expect(results2).toHaveLength(0);
  });

  afterEach(() => {
    mentorRepository.clear();
    skillRepository.clear();
  });
});
