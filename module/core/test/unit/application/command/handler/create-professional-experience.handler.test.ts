import { Test } from '@nestjs/testing';
import { CreateProfessionalExperienceCommand } from '../../../../../src/application/command/create-professional-experience.command';
import { Id as ExperienceId } from '../../../../../src/domain/professional-experience/id';
import { Id as MentorId } from '../../../../../src/domain/mentor/id';
import { CreateProfessionalExperienceHandler } from '../../../../../src/application/command/handler/create-professional-experience.handler';
import { InMemoryProfessionalExperienceRepository } from '../../../../double/repository/in-memory-professional-experience.repository';
import {
  MentorCollectionToken,
  ProfessionalExperienceCollectionToken,
} from '../../../../../src/infrastructure/repository/factory/token.factory';
import { Period } from '../../../../../src/domain/professional-experience/period';
import { InMemoryMentorRepository } from '../../../../double/repository/in-memory-mentor.repository';

describe('[Core/Application] CreateExperienceHandler', () => {
  let createExperienceHandler: CreateProfessionalExperienceHandler;
  let experienceRepository: InMemoryProfessionalExperienceRepository;
  let mentorRepository: InMemoryMentorRepository;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        CreateProfessionalExperienceHandler,
        {
          provide: ProfessionalExperienceCollectionToken,
          useClass: InMemoryProfessionalExperienceRepository,
        },
        {
          provide: MentorCollectionToken,
          useClass: InMemoryMentorRepository,
        },
      ],
    }).compile();

    createExperienceHandler = module.get(CreateProfessionalExperienceHandler);
    experienceRepository = module.get(ProfessionalExperienceCollectionToken);
    mentorRepository = module.get(MentorCollectionToken);
  });

  it('CreateExperienceHandler should be defined', () => {
    expect(createExperienceHandler).toBeDefined();
    expect(experienceRepository).toBeInstanceOf(InMemoryProfessionalExperienceRepository);
  });

  it('ProfessionalExperienceRepository should be created', async () => {
    expect(experienceRepository).toBeDefined();
    expect(experienceRepository).toBeInstanceOf(InMemoryProfessionalExperienceRepository);
  });

  it('MentorRepository should be created', async () => {
    expect(mentorRepository).toBeDefined();
    expect(mentorRepository).toBeInstanceOf(InMemoryMentorRepository);
  });

  test('Create a new professional-professional-experience', async () => {
    const countBefore = await experienceRepository.count();
    const experienceId = ExperienceId.create();
    const mentorId = MentorId.create();
    const period = Period.fromString(new Date(2018, 8, 20).toISOString(), new Date(2018, 10, 5).toISOString(), 'month');
    const command = new CreateProfessionalExperienceCommand(
      experienceId.value,
      'Great Company',
      mentorId.value,
      'Software Engineer',
      period.startDate.value,
      period.endDate.value,
    );
  });
});
