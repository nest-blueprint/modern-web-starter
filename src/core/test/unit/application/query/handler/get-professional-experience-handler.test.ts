import { Test } from '@nestjs/testing';
import { GetProfessionalExperienceHandler } from '../../../../../src/application/query/handler/get-professional-experience.handler';
import { InMemoryMentorRepository } from '../../../../double/repository/in-memory-mentor.repository';
import { GetProfessionalExperienceQuery } from '../../../../../src/application/query/get-professional-experience.query';
import { ProfessionalExperience } from '../../../../../src/domain/professional-experience';
import { InMemoryProfessionalExperienceRepository } from '../../../../double/repository/in-memory-professional-experience.repository';
import { Id as MentorId } from '../../../../../src/domain/mentor/id';
import { Id as UserId } from '../../../../../src/domain/user/id';
import { Id as ExperienceId } from '../../../../../src/domain/professional-experience/id';
import {
  MentorCollectionToken,
  ProfessionalExperienceCollectionToken,
} from '../../../../../src/infrastructure/repository/factory/token.factory';
import { Email } from '../../../../../src/domain/user/email';
import { User } from '../../../../../src/domain/user';
import { Availability } from '../../../../../src/domain/mentor/availability';
import { Period } from '../../../../../src/domain/professional-experience/period';
import { Language } from '../../../../../src/domain/language';
import { Mentor } from '../../../../../src/domain/mentor';
import { Type as TrainingType } from '../../../../../src/domain/training/type';
import { MentorSettings } from '../../../../../src/domain/mentor-settings';
import { ProfessionalExperienceNotFoundException } from '../../../../../src/infrastructure/exception/professional-experience-not-found.exception';
import { Skill } from '../../../../../src/domain/skill';
import { Hash } from 'crypto';
import { Type } from '../../../../../src/domain/user/type';
import { Auth0UserId } from '../../../../../src/infrastructure/resource/auth0/type/auth0-user-id';

describe('[Core/Application] GetProfessionalExperience', () => {
  let experienceRepository: InMemoryProfessionalExperienceRepository;
  let mentorRepository: InMemoryMentorRepository;
  let getProfessionalExperienceHandler: GetProfessionalExperienceHandler;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        GetProfessionalExperienceHandler,
        { provide: ProfessionalExperienceCollectionToken, useClass: InMemoryProfessionalExperienceRepository },
        { provide: MentorCollectionToken, useClass: InMemoryMentorRepository },
      ],
    }).compile();

    getProfessionalExperienceHandler = module.get(GetProfessionalExperienceHandler);
    experienceRepository = module.get(ProfessionalExperienceCollectionToken);
    mentorRepository = module.get(MentorCollectionToken);
  });

  it('getProfessionalExperienceHandler should be defined and instanced', async () => {
    expect(getProfessionalExperienceHandler).toBeDefined();
    expect(getProfessionalExperienceHandler).toBeInstanceOf(GetProfessionalExperienceHandler);
  });

  it('mentorRepository should be defined and instanced', async () => {
    expect(mentorRepository).toBeDefined();
    expect(mentorRepository).toBeInstanceOf(InMemoryMentorRepository);
  });

  it('experienceRepository should be defined and instanced', async () => {
    expect(experienceRepository).toBeDefined();
    expect(experienceRepository).toBeInstanceOf(InMemoryProfessionalExperienceRepository);
  });

  test('Get professional professional experience', async () => {
    const mentorId = MentorId.create();

    // Experience
    const startDate = new Date(2018, 8, 22).toISOString();
    const endDate = new Date(2018, 10, 24).toISOString();
    const professionalExperience = new ProfessionalExperience(
      ExperienceId.create(),
      'Developer',
      'GreatCompany',
      Period.fromString(startDate, endDate, 'month'),
      mentorId,
    );

    const experienceAddResult = await experienceRepository.add(professionalExperience);

    expect(experienceAddResult.isOk()).toBeTruthy();
    expect(experienceAddResult._unsafeUnwrap()).toBeInstanceOf(ProfessionalExperience);

    // Test the query handler
    const experienceId = new ExperienceId(experienceAddResult._unsafeUnwrap().id.value);
    const query = new GetProfessionalExperienceQuery(mentorId.value, [experienceId.value]);
    const resultQuery: ProfessionalExperience[] = await getProfessionalExperienceHandler.execute(query);
    expect(resultQuery.length === 1).toBeTruthy();
    expect(resultQuery[0]).toBeInstanceOf(ProfessionalExperience);

    // Test the query handler with a wrong id;
    const query2 = new GetProfessionalExperienceQuery(mentorId.value, [ExperienceId.create().value]);
    await expect(getProfessionalExperienceHandler.execute(query2)).rejects.toThrowError(
      ProfessionalExperienceNotFoundException,
    );
  });
});
