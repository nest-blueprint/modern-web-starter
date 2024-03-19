import { ProfessionalExperience } from '../../../src/domain/professional-experience';
import { err, ok, Result } from 'neverthrow';
import { Id as ExperienceId } from '../../../src/domain/professional-experience/id';
import { Id as MentorId } from '../../../src/domain/mentor/id';
import { ProfessionalExperienceNotFoundException } from '../../../src/infrastructure/exception/professional-experience-not-found.exception';
import { ProfessionalExperienceAlreadyExistsException } from '../../../src/infrastructure/exception/professional-experience-already-exists.exception';
import { MentorNotFoundException } from '../../../src/infrastructure/exception/mentor-not-found.exception';
import { Injectable } from '@nestjs/common';
import { ProfessionalExperienceCollection } from '../../../src/domain/collection/professional-experience.collection';

@Injectable()
export class InMemoryProfessionalExperienceRepository implements ProfessionalExperienceCollection {
  private experiences: Map<string, ProfessionalExperience> = new Map();

  add(experience: ProfessionalExperience): Result<ProfessionalExperience, Error> {
    if (this.experiences.has(experience.id.value)) {
      return err(new ProfessionalExperienceAlreadyExistsException());
    } else {
      this.experiences.set(experience.id.value, experience);
      return ok(experience);
    }
  }

  delete(id: ExperienceId): Result<ProfessionalExperience, Error> {
    if (!this.experiences.has(id.value)) {
      return err(new ProfessionalExperienceNotFoundException());
    } else {
      const experience = this.experiences.get(id.value);
      this.experiences.delete(id.value);
      return ok(experience);
    }
  }

  get(id: ExperienceId): Result<ProfessionalExperience, Error> {
    if (!this.experiences.has(id.value)) {
      return err(new ProfessionalExperienceNotFoundException());
    } else {
      const experience = this.experiences.get(id.value);
      return ok(experience);
    }
  }

  getFromMentor(id: MentorId): Result<ProfessionalExperience[], Error> {
    const experiencesWithMentor = [...this.experiences.values()].find(
      (experience) => experience.mentorId.value === id.value,
    );
    if (!experiencesWithMentor) return err(new MentorNotFoundException());
    const experiences = [...this.experiences.values()].filter((experience) => experience.mentorId.value === id.value);
    if (experiences.length === 0) return err(new ProfessionalExperienceNotFoundException());
    else return ok(experiences);
  }

  update(experience: ProfessionalExperience): Result<ProfessionalExperience, Error> {
    if (!this.experiences.has(experience.id.value)) {
      return err(new ProfessionalExperienceNotFoundException());
    } else {
      this.experiences.set(experience.id.value, experience);
      return ok(experience);
    }
  }

  count(): number {
    return this.experiences.size;
  }

  findFromMentor(id: MentorId): Result<ProfessionalExperience[], Error> {
    const experiencesWithMentor = [...this.experiences.values()].filter(
      (experience) => experience.mentorId.value === id.value,
    );
    return ok(experiencesWithMentor);
  }

  clear() {
    this.experiences.clear();
  }
}
