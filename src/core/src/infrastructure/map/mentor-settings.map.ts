import { MentorSettings as MentorSettingsEntity } from '../sequelize/entity/mentor-settings.entity';
import { Mentor as MentorEntity } from '../sequelize/entity/mentor.entity';
import { Exclude, plainToInstance, Transform, Type } from 'class-transformer';
import { Id as MentorId } from '../../domain/mentor/id';
import { MentorSettings } from '../../domain/mentor-settings';
import { MentorSettings as MentorSettingsRaw } from '../type/raw/mentor-settings.raw';

import { err, ok, Result } from 'neverthrow';

import { RuntimeErrorException } from '../exception/runtime-error.exception';

export class MentorSettingsMap {
  @Type(() => MentorId)
  @Transform(({ value }) => {
    return new MentorId(value);
  })
  mentor_id: string;

  @Type(() => Boolean)
  @Transform(({ value }) => MentorSettingsMap.toBoolean(value))
  display_current_job_title: number;

  @Type(() => Boolean)
  @Transform(({ value }) => MentorSettingsMap.toBoolean(value))
  display_email: number;

  @Type(() => Boolean)
  @Transform(({ value }) => MentorSettingsMap.toBoolean(value))
  display_linkedin: number;

  @Type(() => Boolean)
  @Transform(({ value }) => MentorSettingsMap.toBoolean(value))
  display_location: number;

  @Type(() => Boolean)
  @Transform(({ value }) => MentorSettingsMap.toBoolean(value))
  display_nickname: number;

  @Type(() => Boolean)
  @Transform(({ value }) => MentorSettingsMap.toBoolean(value))
  display_phone_number: number;

  @Type(() => Boolean)
  @Transform(({ value }) => MentorSettingsMap.toBoolean(value))
  display_profile_photo: number;

  @Exclude()
  mentor: MentorEntity;

  private static toBoolean(value: number): boolean {
    return value > 0;
  }

  static toDomain(mentorSettings: MentorSettingsRaw): Result<MentorSettings, Error>;
  static toDomain(mentorSettings: MentorSettingsEntity): Result<MentorSettings, Error>;
  static toDomain(mentorSettings: MentorSettingsEntity | MentorSettingsRaw): Result<MentorSettings, Error> {
    try {
      if (mentorSettings instanceof MentorSettingsEntity) {
        const mentorSettingsMap = plainToInstance(MentorSettingsMap, mentorSettings.dataValues);
        const {
          mentor_id,
          display_current_job_title,
          display_email,
          display_linkedin,
          display_location,
          display_nickname,
          display_profile_photo,
          display_phone_number,
        } = <never>mentorSettingsMap || {};
        const mappedMentorSettings = new MentorSettings(
          mentor_id,
          display_nickname,
          display_profile_photo,
          display_location,
          display_email,
          display_phone_number,
          display_linkedin,
          display_current_job_title,
        );
        return ok(mappedMentorSettings);
      }
      if (this.containsAllKeys(mentorSettings)) {
        const mentorId = new MentorId(mentorSettings.mentor_id);

        const mappedMentorSettings = new MentorSettings(
          mentorId,
          Boolean(mentorSettings.display_nickname),
          Boolean(mentorSettings.display_profile_photo),
          Boolean(mentorSettings.display_location),
          Boolean(mentorSettings.display_email),
          Boolean(mentorSettings.display_phone_number),
          Boolean(mentorSettings.display_linkedin),
          Boolean(mentorSettings.display_current_job_title),
        );
        return ok(mappedMentorSettings);
      }
      return err(
        new RuntimeErrorException('Failed to map mentor settings', {
          input: mentorSettings,
          method: 'MentorSettingsMap.toDomain',
        }),
      );
    } catch (error: any) {
      return err(
        new RuntimeErrorException('Invalid mentor settings', {
          error,
          input: mentorSettings,
          method: 'MentorSettingsMap.toDomain',
        }),
      );
    }
  }

  private static containsAllKeys(mentorSettings: any): mentorSettings is MentorSettingsRaw {
    return (
      mentorSettings.hasOwnProperty('mentor_id') &&
      mentorSettings.hasOwnProperty('display_current_job_title') &&
      mentorSettings.hasOwnProperty('display_email') &&
      mentorSettings.hasOwnProperty('display_linkedin') &&
      mentorSettings.hasOwnProperty('display_location') &&
      mentorSettings.hasOwnProperty('display_nickname') &&
      mentorSettings.hasOwnProperty('display_profile_photo') &&
      mentorSettings.hasOwnProperty('display_phone_number')
    );
  }
  static toJSON(mentorSettings: MentorSettings) {
    return MentorSettingsMap.toRaw(mentorSettings);
  }

  static toRaw(mentorSettings: MentorSettings): MentorSettingsRaw {
    return {
      mentor_id: mentorSettings.mentorId.value,
      display_current_job_title: mentorSettings.settingDisplayCurrentJobTitle,
      display_email: mentorSettings.settingDisplayEmail,
      display_linkedin: mentorSettings.settingDisplayLinkedin,
      display_location: mentorSettings.settingDisplayLocation,
      display_nickname: mentorSettings.settingDisplayNickname,
      display_profile_photo: mentorSettings.settingDisplayProfilePhoto,
      display_phone_number: mentorSettings.settingDisplayPhoneNumber,
    };
  }

  static toEntity(mentorSettings: MentorSettings): MentorSettingsEntity {
    return plainToInstance(MentorSettingsEntity, MentorSettingsMap.toRaw(mentorSettings));
  }
}
