import { MentorSettings } from '../../../../src/domain/mentor-settings';
import { Id as MentorId } from '../../../../src/domain/mentor/id';
import { Uuid } from '../../../../src/infrastructure/type/uuid.type';

describe('[Core/Domain/Mentor] MentorSettings', () => {
  test('should create a mentor settings', () => {
    const mentorId = new MentorId(Uuid.random());
    const mentorSettings = new MentorSettings(mentorId, true, true, true, true, true, true, true);

    expect(mentorSettings).toBeInstanceOf(MentorSettings);
  });

  test('instantiation should fail with every invalid argument provided', () => {
    const mentorId = new MentorId(Uuid.random());

    expect(() => new MentorSettings(null, true, true, true, true, true, true, true)).toThrow();
    expect(() => new MentorSettings(mentorId, null, true, true, true, true, true, true)).toThrow();
    expect(() => new MentorSettings(mentorId, true, null, true, true, true, true, true)).toThrow();
    expect(() => new MentorSettings(mentorId, true, true, null, true, true, true, true)).toThrow();
    expect(() => new MentorSettings(mentorId, true, true, true, null, true, true, true)).toThrow();
    expect(() => new MentorSettings(mentorId, true, true, true, true, null, true, true)).toThrow();
    expect(() => new MentorSettings(mentorId, true, true, true, true, true, null, true)).toThrow();
    expect(() => new MentorSettings(mentorId, true, true, true, true, true, true, null)).toThrow();
  });
});
