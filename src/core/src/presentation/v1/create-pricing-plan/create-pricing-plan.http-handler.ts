import { Request, Controller, UseGuards, Post, Body } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { routesV1 } from '../../../../config/routes-v1';
import { CreatePricingPlanCommand } from '../../../application/command/create-pricing-plan.command';
import { GetPricingPlanQuery } from '../../../application/query/get-pricing-plan.query';
import { QueryBus } from '@nestjs/cqrs';
import { SequelizeTransactionDelegator } from '../../../infrastructure/pattern-cqrs/delegator/sequelize-transaction.delegator';
import { PricingPlan } from '../../../domain/pricing-plan';
import { Id as MentorId } from '../../../domain/mentor/id';
import { Id as PricingPlanId } from '../../../domain/pricing-plan/id';
import { CreatePricingPlanEntity } from './create-pricing-plan.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../infrastructure/resource/auth0/guard/roles.guard';
import { UserRole } from '../../../infrastructure/resource/auth0/roles';
import { Roles } from '../../../infrastructure/resource/auth0/decorator/roles.decorator';
import { JwtPayload as Auth0JwtPayload } from '../../../infrastructure/authentication/auth0/module/interface/jwt-payload.interface';
import { UserService } from '../../../infrastructure/service/user/user.service';
import { Auth0UserId } from '../../../infrastructure/resource/auth0/type/auth0-user-id';
import { TypedQueryParam } from '../../../infrastructure/http/param/decorator/typed-param.decorator';
import { validate } from 'typia';
import { RequestBodyValidationFailedException } from '../../../infrastructure/http/validation/exception/request-body-validation-failed.exception';

@Controller(routesV1.pricing_plan.root)
export class CreatePricingPlanHttpHandler {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly transactionDelegator: SequelizeTransactionDelegator,
    private readonly userService: UserService,
  ) {}

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(UserRole.mentor)
  @Post()
  async createPricingPlan(
    @TypedQueryParam({ name: 'mentor_id', type: 'uuid', nullable: false }) mentorId: string,
    @Body() body: CreatePricingPlanEntity,
    @Request() request: ExpressRequest & { user: Auth0JwtPayload },
  ) {
    this.ensureIsValidEntity(body);

    const user: Auth0JwtPayload = request.user;

    const auth0UserId = new Auth0UserId(user.sub);
    const mentorIdObject = new MentorId(mentorId);

    await this.ensureAuthentication(auth0UserId, mentorIdObject);

    const createPricingPlanCommand = this.generateNewPricingPlanCommand(mentorId, body);

    await this.transactionDelegator.execute(createPricingPlanCommand);

    const response = await this.getCreatedPricingPlan(createPricingPlanCommand.id, mentorId);

    return response;
  }

  private async ensureAuthentication(auth0UserId: Auth0UserId, mentorId: MentorId) {
    await this.userService.ensureAuth0IdIsMatchingUserAccount(auth0UserId, mentorId);
  }

  private generateNewPricingPlanCommand(mentorId: string, validatedRequestBody: CreatePricingPlanEntity) {
    const pricingPlanId = PricingPlanId.create();
    return new CreatePricingPlanCommand(
      pricingPlanId.value,
      mentorId,
      validatedRequestBody.course_type,
      validatedRequestBody.price_currency.currency,
      validatedRequestBody.price_amount,
      validatedRequestBody.rate_type,
      validatedRequestBody.title,
    );
  }

  private async getCreatedPricingPlan(pricingPlanId: string, mentorId: string) {
    const getPricingPlanQuery = new GetPricingPlanQuery(mentorId, [pricingPlanId]);

    const getPricingPlanQueryResult: PricingPlan[] = await this.queryBus.execute(getPricingPlanQuery);
    const pricingPlan = getPricingPlanQueryResult[0];

    return {
      id: pricingPlan.id.value,
      title: pricingPlan.title,
      course_type: pricingPlan.trainingType.value,
      price_currency: { currency: pricingPlan.rate.currency.code },
      price_amount: pricingPlan.rate.amount.value,
      rate_type: pricingPlan.pricingType.value,
    };
  }

  private ensureIsValidEntity(entity: CreatePricingPlanEntity) {
    const validationResult = validate<CreatePricingPlanEntity>(entity);
    if (!validationResult.success) {
      throw new RequestBodyValidationFailedException(validationResult.errors);
    }
  }
}
