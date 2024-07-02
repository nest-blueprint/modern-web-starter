import { Get, Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { routesV1 } from '../../../../config/routes-v1';
import { GetProfessionalExperienceQuery } from '../../../application/query/get-professional-experience.query';
import { TypedQueryParam } from '../../../infrastructure/http/param/decorator/typed-param.decorator';
import { uuidArrayTypeAssert } from '../../../infrastructure/http/assert/uuid-array-type.assert';

@Controller(routesV1.professional_experience.root)
export class GetProfessionalExperienceHttpHandler {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async getProfessionalExperience(
    @TypedQueryParam({ name: 'mentor_id', type: 'uuid', nullable: false }) mentorId: string,
    @TypedQueryParam({ name: 'ids', type: 'any', nullable: false, assertFunction: uuidArrayTypeAssert }) ids: string[],
  ) {
    const query = new GetProfessionalExperienceQuery(mentorId, ids);
    const experiences = await this.queryBus.execute(query);
    return experiences.map((experience) => ({
      id: experience.id.value,
      title: experience.jobTitle,
      company: experience.company,
      start_date: experience.period.startDate.value,
      end_date: experience.period.endDate.value,
    }));
  }
}
