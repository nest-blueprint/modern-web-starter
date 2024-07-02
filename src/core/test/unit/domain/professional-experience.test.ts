import { Id as ProfessionalExperienceId } from '../../../src/domain/professional-experience/id';
import { Id as MentorId } from '../../../src/domain/mentor/id';
import { Period } from '../../../src/domain/professional-experience/period';
import { Datetime } from '../../../src/infrastructure/type/datetime.type';
import { ProfessionalExperience } from '../../../src/domain/professional-experience';

describe('[Core/Domain] ProfessionalExperience', () => {
  test('should create a professional experience', () => {
    const professionalExperienceId = ProfessionalExperienceId.create();
    const mentorId = MentorId.create();
    const jobTitle = 'Software Engineer';
    const company = 'Swarmtech';
    const startDate = Datetime.fromDate(new Date('2019-01-01'));
    const endDate = Datetime.fromDate(new Date('2020-01-01'));
    const period = Period.fromDateTimes(startDate, endDate, 'year');

    const professionalExperience = new ProfessionalExperience(
      professionalExperienceId,
      jobTitle,
      company,
      period,
      mentorId,
    );

    expect(professionalExperience).toBeInstanceOf(ProfessionalExperience);
  });

  test('instantiation should fail with every invalid argument provided', () => {
    const professionalExperienceId = ProfessionalExperienceId.create();
    const mentorId = MentorId.create();
    const jobTitle = 'Software Engineer';
    const company = 'Swarmtech';
    const startDate = Datetime.fromDate(new Date('2019-01-01'));
    const endDate = Datetime.fromDate(new Date('2020-01-01'));
    const period = Period.fromDateTimes(startDate, endDate, 'year');

    expect(() => new ProfessionalExperience(null, jobTitle, company, period, mentorId)).toThrow();
    expect(() => new ProfessionalExperience(professionalExperienceId, null, company, period, mentorId)).toThrow();
    expect(() => new ProfessionalExperience(professionalExperienceId, jobTitle, null, period, mentorId)).toThrow();
    expect(() => new ProfessionalExperience(professionalExperienceId, jobTitle, company, null, mentorId)).toThrow();
    expect(() => new ProfessionalExperience(professionalExperienceId, jobTitle, company, period, null)).toThrow();
  });
});
