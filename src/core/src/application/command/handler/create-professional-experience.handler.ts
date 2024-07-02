import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { CommandHandlerInterface } from '../../interface/command-handler.interface';
import { CreateProfessionalExperienceCommand } from '../create-professional-experience.command';
import { Id } from '../../../domain/professional-experience/id';
import { Period } from '../../../domain/professional-experience/period';
import { Datetime } from '../../../infrastructure/type/datetime.type';
import { Id as MentorId } from '../../../domain/mentor/id';

import {
  MentorCollectionToken,
  ProfessionalExperienceCollectionToken,
} from '../../../infrastructure/repository/factory/token.factory';
import { ProfessionalExperienceCollection } from '../../../domain/collection/professional-experience.collection';
import { MentorCollection } from '../../../domain/collection/mentor.collection';
import { ProfessionalExperienceCreationFailedException } from '../../../infrastructure/exception/professional-experience-creation-failed.exception';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { InvalidArgumentCommandException } from '../../exception/command/invalid-argument-command.exception';
import { ProfessionalExperience } from '../../../domain/professional-experience';

@CommandHandler(CreateProfessionalExperienceCommand)
export class CreateProfessionalExperienceHandler implements CommandHandlerInterface {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(MentorCollectionToken) private readonly mentorRepository: MentorCollection,
    @Inject(ProfessionalExperienceCollectionToken)
    private readonly experienceRepository: ProfessionalExperienceCollection,
  ) {}

  async execute(command: CreateProfessionalExperienceCommand) {
    this.logger.debug('CreateProfessionalExperienceHandler.execute', { command });

    const { id, jobTitle, company, period, mentorId } = this.getValueObjectsFromCommand(command);

    await this.findExistingMentor(mentorId);
    const experiencesPreviouslySaved = await this.retrieveMentorProfessionalExperiences(mentorId);
    this.ensureDatesAreNotOverlapping(experiencesPreviouslySaved, period, mentorId);

    const experience = new ProfessionalExperience(id, jobTitle, company, period, mentorId);
    await this.addToTheRepository(experience, mentorId);

    this.logger.debug('CreateProfessionalExperienceHandler.execute : success');
  }

  private async addToTheRepository(experience: ProfessionalExperience, mentorId: MentorId) {
    this.logger.debug('CreateProfessionalExperienceHandler.execute : add to the repository', { experience });

    const experienceAddedResult = await this.experienceRepository.add(experience);

    if (experienceAddedResult.isErr()) {
      throw new ProfessionalExperienceCreationFailedException(
        'Cannot create professional professional-experience for the mentor ' + mentorId.value,
        experienceAddedResult,
      );
    }
  }

  private ensureDatesAreNotOverlapping(experiencesPreviouslySaved, period: Period, mentorId: MentorId) {
    this.logger.debug('CreateProfessionalExperienceHandler.execute : ensure dates are not overlapping');
    if (
      experiencesPreviouslySaved.some((experiencePreviouslySaved) => experiencePreviouslySaved.period.overlap(period))
    ) {
      throw new ProfessionalExperienceCreationFailedException(
        'Cannot create professional professional-experience for the mentor ' + mentorId.value,
        'The period is overlapping with an existing period',
      );
    }
  }

  private async retrieveMentorProfessionalExperiences(mentorId: MentorId) {
    this.logger.debug('CreateProfessionalExperienceHandler.execute : retrieve mentor professional experiences');
    const experiencesPreviouslySavedResult = await this.experienceRepository.findFromMentor(mentorId);
    if (experiencesPreviouslySavedResult.isErr()) {
      throw new ProfessionalExperienceCreationFailedException(
        'Cannot create professional professional-experience for the mentor ' + mentorId.value,
        experiencesPreviouslySavedResult.error,
      );
    }

    return experiencesPreviouslySavedResult.value;
  }

  private async findExistingMentor(mentorId: MentorId) {
    this.logger.debug('CreateProfessionalExperienceHandler.execute : find existing mentor', { mentorId });
    const mentor = await this.mentorRepository.get(mentorId);
    if (mentor.isErr()) {
      throw new ProfessionalExperienceCreationFailedException(
        'Cannot create professional professional-experience for the mentor ' + mentorId.value,
        mentor.error,
      );
    }
  }

  private getValueObjectsFromCommand(command: CreateProfessionalExperienceCommand) {
    try {
      const id = new Id(command.id);
      const jobTitle = command.jobTitle;
      const company = command.company;
      const startDatetime = new Datetime(command.startDate);
      const endDatetime = new Datetime(command.endDate);
      const period = Period.fromDateTimes(startDatetime, endDatetime, 'month');
      const mentorId = new MentorId(command.mentor_id);
      return { id, jobTitle, company, period, mentorId };
    } catch (error) {
      throw new InvalidArgumentCommandException('Cannot create professional experience', error);
    }
  }
}
