import { InMemoryUserRepository } from '../../../test/double/repository/in-memory-user-repository';
import { InMemoryCustomerRepository } from '../../../test/double/repository/in-memory-customer.repository';
import { InMemoryMentorRepository } from '../../../test/double/repository/in-memory-mentor.repository';
import { InMemoryPersonRepository } from '../../../test/double/repository/in-memory-person.repository';
import { InMemoryPricingPlanRepository } from '../../../test/double/repository/in-memory-pricing-plan.repository';
import { InMemoryProfessionalExperienceRepository } from '../../../test/double/repository/in-memory-professional-experience.repository';
import { InMemorySkillRepository } from '../../../test/double/repository/in-memory-skill.repository';

export type Repositories = {
  user: undefined | InMemoryUserRepository;
  mentor: undefined | InMemoryMentorRepository;
  person: undefined | InMemoryPersonRepository;
  skill: undefined | InMemorySkillRepository;
  pricingPlan: undefined | InMemoryPricingPlanRepository;
  professionalExperience: undefined | InMemoryProfessionalExperienceRepository;
  customer: undefined | InMemoryCustomerRepository;
};
