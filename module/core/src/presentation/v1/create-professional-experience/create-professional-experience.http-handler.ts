import { Request, Controller, UseGuards, Post, Body } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { QueryBus } from '@nestjs/cqrs';
import { routesV1 } from '../../../../config/routes-v1';
import { CreateProfessionalExperienceCommand } from '../../../application/command/create-professional-experience.command';
import { GetProfessionalExperienceQuery } from '../../../application/query/get-professional-experience.query';
import { SequelizeTransactionDelegator } from '../../../infrastructure/pattern-cqrs/delegator/sequelize-transaction.delegator';
import { Id as MentorId } from '../../../domain/mentor/id';
import { CreateProfessionalExperienceEntity } from './create-professional-experience.entity';
import { Uuid } from '../../../infrastructure/type/uuid.type';
import { UserService } from '../../../infrastructure/service/user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../infrastructure/resource/auth0/guard/roles.guard';
import { UserRole } from '../../../infrastructure/resource/auth0/roles';
import { Roles } from '../../../infrastructure/resource/auth0/decorator/roles.decorator';
import { JwtPayload as Auth0JwtPayload } from '../../../infrastructure/authentication/auth0/module/interface/jwt-payload.interface';
import { Auth0UserId } from '../../../infrastructure/resource/auth0/type/auth0-user-id';
import { TypedQueryParam } from '../../../infrastructure/http/param/decorator/typed-param.decorator';
import { validate } from 'typia';
import { RequestBodyValidationFailedException } from '../../../infrastructure/http/validation/exception/request-body-validation-failed.exception';

@Controller(routesV1.professional_experience.root)
export class CreateProfessionalExperienceHttpHandler {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly transactionDelegator: SequelizeTransactionDelegator,
    private readonly userService: UserService,
  ) {}

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(UserRole.mentor)
  @Post()
  async createProfessionalExperience(
    @TypedQueryParam({ name: 'mentor_id', type: 'uuid', nullable: false }) mentorIdParam: string,
    @Body() requestBody: CreateProfessionalExperienceEntity,
    @Request() request: ExpressRequest & { user: Auth0JwtPayload },
  ) {
    this.ensureIsValidEntity(requestBody);

    const user: Auth0JwtPayload = request.user;

    const auth0UserId = new Auth0UserId(user.sub);

    const mentorId = new MentorId(mentorIdParam);

    await this.ensureAuthentication(auth0UserId, mentorId);

    const professionalExperienceId = Uuid.random();
    const command = new CreateProfessionalExperienceCommand(
      professionalExperienceId,
      requestBody.company,
      mentorId.value,
      requestBody.title,
      requestBody.start_date,
      requestBody.end_date,
    );

    await this.transactionDelegator.execute(command);

    const getExperienceQuery = new GetProfessionalExperienceQuery(mentorId.value, [professionalExperienceId]);
    const experience = (await this.queryBus.execute(getExperienceQuery))[0];

    return {
      id: experience.id.value,
      title: experience.jobTitle,
      company: experience.company,
      start_date: experience.period.startDate.value,
      end_date: experience.period.endDate.value,
    };
  }

  private async ensureAuthentication(auth0UserId: Auth0UserId, mentorId: MentorId) {
    await this.userService.ensureAuth0IdIsMatchingUserAccount(auth0UserId, mentorId);
  }

  private ensureIsValidEntity(entity: CreateProfessionalExperienceEntity) {
    const validationResult = validate<CreateProfessionalExperienceEntity>(entity);
    if (!validationResult.success) {
      throw new RequestBodyValidationFailedException(validationResult.errors);
    }
  }
}
