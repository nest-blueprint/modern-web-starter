import { InMemoryMentorRepository } from '../../../../double/repository/in-memory-mentor.repository';
import { Test } from '@nestjs/testing';
import { Mentor } from '../../../../../src/domain/mentor';
import { GetMentorByIdsHandler } from '../../../../../src/application/query/handler/get-mentor-by-ids.handler';
import { GetMentorByIdsQuery } from '../../../../../src/application/query/get-mentor-by-ids.query';
import { MentorCollectionToken } from '../../../../../src/infrastructure/repository/factory/token.factory';
import { Id as MentorId } from '../../../../../src/domain/mentor/id';
import { User } from '../../../../../src/domain/user';
import { Id as UserId } from '../../../../../src/domain/user/id';
import { Email } from '../../../../../src/domain/user/email';
import { Availability } from '../../../../../src/domain/mentor/availability';
import { Language } from '../../../../../src/domain/language';
import { Type as TrainingType } from '../../../../../src/domain/training/type';
import { MentorSettings } from '../../../../../src/domain/mentor-settings';
import { MentorNotFoundException } from '../../../../../src/infrastructure/exception/mentor-not-found.exception';
import { Skill } from '../../../../../src/domain/skill';
import { Type } from '../../../../../src/domain/user/type';

describe('[Core/Application] GetMentorByIdsHandler', () => {
  let mentorRepository: InMemoryMentorRepository;
  let getMentorByIdsHandler: GetMentorByIdsHandler;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [GetMentorByIdsHandler, { provide: MentorCollectionToken, useClass: InMemoryMentorRepository }],
    }).compile();

    getMentorByIdsHandler = module.get(GetMentorByIdsHandler);
    mentorRepository = module.get(MentorCollectionToken);
  });

  it('GetMentorByIdsHandler should be defined and instanced', () => {
    expect(getMentorByIdsHandler).toBeDefined();
    expect(getMentorByIdsHandler instanceof GetMentorByIdsHandler).toBeTruthy();
  });

  it('MentorRepository should be defined and instanced', () => {
    expect(mentorRepository).toBeDefined();
    expect(mentorRepository instanceof InMemoryMentorRepository).toBeTruthy();
  });

  test('Return one mentor using id', async () => {
    // Mentor

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
      [Skill.create('Java'), Skill.create('Python')],
      settings,
    );

    const mentorAddResult = await mentorRepository.add(mentor);
    expect(mentorAddResult.isOk()).toBeTruthy();
    expect(mentorAddResult._unsafeUnwrap()).toBeInstanceOf(Mentor);
    expect(mentorAddResult._unsafeUnwrap().id.value).toBe(mentorId.value);

    const getMentorWithIdsQuery = new GetMentorByIdsQuery([mentor.id.value]);
    const result = await getMentorByIdsHandler.execute(getMentorWithIdsQuery);
    expect(result.length).toBe(1);
    expect(result[0].id.value).toBe(mentor.id.value);
  });
  test('Return multiple mentors using ids', async () => {
    // Mentor 1

    const mentorId1 = MentorId.create();

    const role1 = new Type('mentor');
    const user1 = User.create(UserId.create(), Email.fromString('john.doe@example.com'), role1);

    const profileDescription1 = 'profile';
    const availability1 = Availability.fromString('full_time');
    const languages1 = [Language.fromString('en')];
    const trainingTypes1 = [TrainingType.fromString('remote')];
    const settings1 = new MentorSettings(mentorId1, true, true, true, true, true, true, true);
    const mentor1 = Mentor.create(
      mentorId1,
      user1,
      profileDescription1,
      availability1,
      languages1,
      trainingTypes1,
      [Skill.create('Java'), Skill.create('Python')],
      settings1,
    );

    // Mentor 2

    const mentorId = MentorId.create();
    const role = new Type('mentor');
    const user = User.create(UserId.create(), Email.fromString('alice.smith@example.com'), role);
    const profileDescription = 'profile';
    const availability = Availability.fromString('one_time');
    const languages = [Language.fromString('fr')];
    const trainingTypes = [TrainingType.fromString('face_to_face')];
    const settings = new MentorSettings(mentorId, true, true, true, true, true, true, true);
    const mentor = Mentor.create(
      mentorId,
      user,
      profileDescription,
      availability,
      languages,
      trainingTypes,
      [Skill.create('Java'), Skill.create('Python')],
      settings,
    );

    // Add mentors to repository

    const resultAddMentor = await mentorRepository.add(mentor);
    const resultAddMentor1 = await mentorRepository.add(mentor1);

    expect(resultAddMentor.isOk()).toBeTruthy();
    expect(resultAddMentor1.isOk()).toBeTruthy();
    expect(resultAddMentor._unsafeUnwrap()).toBeInstanceOf(Mentor);
    expect(resultAddMentor1._unsafeUnwrap()).toBeInstanceOf(Mentor);

    // Get mentors by ids using the query handler

    const getMentorWithIdsQuery = new GetMentorByIdsQuery([mentor1.id.value, mentor.id.value]);
    const result = await getMentorByIdsHandler.execute(getMentorWithIdsQuery);
    expect(result.length).toBe(2);

    // Try to get a mentor that does not exist
    const getMentorWithIdsQuery2 = new GetMentorByIdsQuery([
      mentor.id.value,
      MentorId.create().value,
      MentorId.create().value,
    ]);

    await expect(getMentorByIdsHandler.execute(getMentorWithIdsQuery2)).rejects.toThrowError(MentorNotFoundException);
  });
});
