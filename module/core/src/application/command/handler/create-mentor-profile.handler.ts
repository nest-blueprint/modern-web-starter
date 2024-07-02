import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { CommandHandlerInterface } from '../../interface/command-handler.interface';
import { Mentor } from '../../../domain/mentor';
import { MentorCollection } from '../../../domain/collection/mentor.collection';
import { Availability } from '../../../domain/mentor/availability';
import { Type as TrainingType } from '../../../domain/training/type';
import { Id as MentorId } from '../../../domain/mentor/id';
import { Id as UserId } from '../../../domain/user/id';
import { UserCollection } from '../../../domain/collection/user.collection';
import { SkillCollection } from '../../../domain/collection/skill.collection';
import { Language } from '../../../domain/language';
import { MentorSettings } from '../../../domain/mentor-settings';
import {
  MentorCollectionToken,
  SkillCollectionToken,
  UserCollectionToken,
} from '../../../infrastructure/repository/factory/token.factory';
import { Skill } from '../../../domain/skill';
import { MentorCreationFailedException } from '../../../infrastructure/exception/mentor-creation-failed.exception';
import { CreateMentorProfileCommand } from '../create-mentor-profile.command';
import { InvalidArgumentCommandException } from '../../exception/command/invalid-argument-command.exception';
import { RuntimeErrorException } from '../../../infrastructure/exception/runtime-error.exception';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@CommandHandler(CreateMentorProfileCommand)
export class CreateMentorProfileHandler implements CommandHandlerInterface {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    @Inject(MentorCollectionToken) private readonly mentorCollection: MentorCollection,
    @Inject(UserCollectionToken) private readonly userCollection: UserCollection,
    @Inject(SkillCollectionToken) private readonly skillCollection: SkillCollection,
  ) {}

  async execute(command: CreateMentorProfileCommand) {
    this.logger.debug(`CreateMentorProfileHandler.execute`, command);
    const { skills } = this.getValueObjectsFromCommand(command);

    const mentor = await this.createMentorObject(command);

    await this.addMentorDataToRepository(mentor, skills);

    this.logger.debug(`CreateMentorProfileHandler.execute : success`);
  }

  private async createMentorObject(command: CreateMentorProfileCommand) {
    this.logger.debug(`CreateMentorProfileHandler.execute : create mentor object`, command);
    const userFound = await this.userCollection.get(new UserId(command.userId));

    // At this point, the user should exist, because the user service should have checked that previously
    if (userFound.isErr()) {
      throw new RuntimeErrorException('User not found while creating mentor profile');
    }

    try {
      const { availability, languages, trainingType, mentorId, mentorSettings } =
        this.getValueObjectsFromCommand(command);

      return new Mentor(
        mentorId,
        userFound.value,
        command.profileDescription,
        availability,
        languages,
        trainingType,
        mentorSettings,
        [],
        [],
        [],
        command?.currentJobTitle,
        command?.profileTitle,
      );
    } catch (error: any) {
      throw new InvalidArgumentCommandException(error.message, error);
    }
  }

  private getValueObjectsFromCommand(command: CreateMentorProfileCommand) {
    // Create the mentor, based on the provided data
    const availability = Availability.fromString(command.availability);
    const languages = command.languages.map((lang) => Language.fromString(lang));
    const trainingType = command.trainingType.map((type) => TrainingType.fromString(type));
    const mentorId = new MentorId(command.mentorId);
    const skills = command.skills.map((skill) => Skill.create(skill));
    const mentorSettings = new MentorSettings(
      mentorId,
      command.settingDisplayName,
      command.settingDisplayProfilePhoto,
      command.settingDisplayLocation,
      command.settingDisplayEmail,
      command.settingDisplayPhone,
      command.settingDisplayLinkedin,
      command.settingDisplayCurrentJobTitle,
    );

    return { availability, languages, trainingType, mentorId, mentorSettings, skills };
  }

  private async addMentorDataToRepository(mentor: Mentor, skills: Skill[]) {
    this.logger.debug(`CreateMentorProfileHandler.execute : add mentor to the repository`, mentor);
    const addMentorResult = await this.mentorCollection.add(mentor);
    if (addMentorResult.isErr()) {
      throw new MentorCreationFailedException(`Cannot create mentor profile`, addMentorResult.error);
    }

    // Before adding the skills to the mentor, we need to make sure that the skills exist in the global skill collection
    await this.addMissingSkillsGlobaly(skills);

    // Add the skills to the mentor
    await this.updateMentorSkills(mentor.id, skills);
  }

  private async addMissingSkillsGlobaly(skills: Skill[]) {
    this.logger.debug(`CreateMentorProfileHandler.execute : add missing skills globally to the repository`, skills);
    // Add new skills globally
    const upsertResult = await this.skillCollection.upsertSkill(skills);

    if (upsertResult.isErr()) {
      throw new MentorCreationFailedException(`Cannot create mentor profile`, upsertResult.error);
    }
  }

  private async updateMentorSkills(mentorId: MentorId, skills: Skill[]) {
    this.logger.debug(
      `CreateMentorProfileHandler.execute : update mentor's skills and set them to the repository`,
      skills,
    );
    const addSkillsResult = await this.skillCollection.setMentorSkills(mentorId, skills);

    if (addSkillsResult.isErr()) {
      throw new MentorCreationFailedException(`Cannot create mentor profile`, addSkillsResult.error);
    }
  }
}
