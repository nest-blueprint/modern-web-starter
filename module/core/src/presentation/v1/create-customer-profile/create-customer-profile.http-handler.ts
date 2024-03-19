import { Request, Controller, HttpCode, HttpStatus, UseGuards, Post, Body } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { routesV1 } from '../../../../config/routes-v1';
import { Id as UserId } from '../../../domain/user/id';
import { QueryBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../../../application/command/register-user.command';
import { SequelizeTransactionDelegator } from '../../../infrastructure/pattern-cqrs/delegator/sequelize-transaction.delegator';
import { CreateCustomerProfileEntity } from './create-customer-profile.entity';
import { Auth0UserId } from '../../../infrastructure/resource/auth0/type/auth0-user-id';
import { BadRequestException } from '../../../infrastructure/exception/bad-request.exception';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload as Auth0JwtPayload } from '../../../infrastructure/authentication/auth0/module/interface/jwt-payload.interface';
import { UserResource as Auth0UserResource } from '../../../infrastructure/resource/auth0/resources/user.resource';
import { UserRole } from '../../../infrastructure/resource/auth0/roles';
import { Id as CustomerId } from '../../../domain/customer/id';
import { CreateCustomerProfileCommand } from '../../../application/command/create-customer-profile-command';
import { UserService } from '../../../infrastructure/service/user/user.service';
import { CommandInterface } from '../../../application/interface/command.interface';
import { AppMetadata, User as Auth0User, UserMetadata } from 'auth0';
import { UserData } from '../../../infrastructure/service/user/type/user-data.type';
import { GetCustomerProfileByIdQuery } from '../../../application/query/get-customer-profile-by-id.query';
import { Customer } from '../../../domain/customer';
import { Type as CustomerTypeObject } from '../../../domain/customer/type';
import { validate } from 'typia';
import { RequestBodyValidationFailedException } from '../../../infrastructure/http/validation/exception/request-body-validation-failed.exception';
import { ConflictException } from '../../../infrastructure/exception/conflict.exception';
@Controller(routesV1.customer.root)
export class CreateCustomerProfileHttpHandler {
  constructor(
    private readonly transactionDelegator: SequelizeTransactionDelegator,
    private readonly queryBus: QueryBus,
    private readonly auth0UserResource: Auth0UserResource,
    private readonly userService: UserService,
  ) {}

  @UseGuards(AuthGuard())
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() request: ExpressRequest & { user: Auth0JwtPayload },
    @Body() body: CreateCustomerProfileEntity,
  ) {
    this.ensureIsValidEntity(body);

    const user: Auth0JwtPayload = request.user;

    const auth0UserId = new Auth0UserId(user.sub);

    const authOUserData = await this.getAuth0UserData(auth0UserId);

    this.ensureUserHasVerifiedEmail(authOUserData);

    const userData = await this.ensureUserCanCreateCustomerProfile(auth0UserId);
    const customerType = CustomerTypeObject.fromString(body.type);

    const customerId = await this.createCustomerProfile(userData, authOUserData, customerType);

    await this.applyCustomerRole(auth0UserId);

    const createdCustomerProfile: Customer = await this.getCreatedCustomerProfile(customerId);

    return {
      id: createdCustomerProfile.id.value,
      type: createdCustomerProfile.customerType.value,
    };
  }

  private async createCustomerProfile(
    userData: UserData,
    authOUserData: Auth0User<UserMetadata, AppMetadata>,
    customerType: CustomerTypeObject,
  ) {
    let customerId;

    if (!userData.hasUserAccount) {
      customerId = await this.createAccountWithCustomerProfile(userData.auth0UserId, authOUserData, customerType);
      return customerId;
    }

    customerId = await this.createOnlyCustomerProfile(userData.user?.id, customerType);
    return customerId;
  }

  private async getAuth0UserData(auth0UserId: Auth0UserId) {
    const auth0UserResult = await this.auth0UserResource.getUser(auth0UserId);
    if (auth0UserResult.isErr()) {
      throw auth0UserResult.error;
    }

    return auth0UserResult.value;
  }

  private ensureUserHasVerifiedEmail(auth0UserData: Auth0User<UserMetadata, AppMetadata>) {
    if (!auth0UserData.email_verified && auth0UserData.email_verified === true) {
      throw new BadRequestException(
        'Cannot create customer profile, user is not verified. You need to verify your email first.',
      );
    }
  }

  private async ensureUserCanCreateCustomerProfile(auth0UserId: Auth0UserId): Promise<UserData> {
    const userData = await this.userService.getUserAccountData(auth0UserId);

    // If the user has already a mentor account
    if (userData.hasUserAccount && userData.user.userType.value === UserRole.mentor) {
      throw new ConflictException('Cannot create customer profile, the user is register  as mentor');
    }

    // If the user has already a customer account with a customer profile set up
    if (userData.hasUserAccount && userData.profile.hasProfile && userData.profile.isCustomer) {
      throw new ConflictException('Cannot create customer profile, user already has a customer profile.');
    }

    return userData;
  }

  private async createAccountWithCustomerProfile(
    auth0UserId: Auth0UserId,
    auth0UserData: Auth0User<UserMetadata, AppMetadata>,
    customerType: CustomerTypeObject,
  ) {
    const commands: CommandInterface[] = [];
    const userId = UserId.create();

    const registerUserCommand = new RegisterUserCommand(
      userId.value,
      auth0UserData.email,
      UserRole.customer,
      auth0UserId.value,
    );

    // Create a customer profile
    const customerId = CustomerId.create();

    const createCustomerProfileCommand = new CreateCustomerProfileCommand(
      userId.value,
      customerId.value,
      customerType.value,
    );

    commands.push(registerUserCommand, createCustomerProfileCommand);
    await this.transactionDelegator.execute(commands);
    return customerId;
  }

  private async createOnlyCustomerProfile(userId: UserId, customerType: CustomerTypeObject) {
    // Create a customer profile
    const customerId = CustomerId.create();

    const createCustomerProfileCommand = new CreateCustomerProfileCommand(
      userId.value,
      customerId.value,
      customerType.value,
    );

    await this.transactionDelegator.execute(createCustomerProfileCommand);

    return customerId;
  }

  private async applyCustomerRole(auth0UserId: Auth0UserId) {
    await this.auth0UserResource.applyUserRoles(auth0UserId, [UserRole.customer]);
  }

  private async getCreatedCustomerProfile(customerId: CustomerId) {
    const getCustomerProfileQuery = new GetCustomerProfileByIdQuery(customerId.value);
    const queryResult = await this.queryBus.execute(getCustomerProfileQuery);
    return queryResult;
  }

  private ensureIsValidEntity(body: CreateCustomerProfileEntity) {
    const validationResult = validate<CreateCustomerProfileEntity>(body);
    if (!validationResult.success) {
      throw new RequestBodyValidationFailedException(validationResult.errors);
    }
  }
}
