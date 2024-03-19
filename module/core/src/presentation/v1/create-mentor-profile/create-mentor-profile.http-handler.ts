import { Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { routesV1 } from '../../../../config/routes-v1';
import { QueryBus } from '@nestjs/cqrs';
import { CreatePersonCommand } from '../../../application/command/create-person.command';
import { GetMentorByIdsQuery } from '../../../application/query/get-mentor-by-ids.query';
import { SequelizeTransactionDelegator } from '../../../infrastructure/pattern-cqrs/delegator/sequelize-transaction.delegator';
import { Mentor } from '../../../domain/mentor';
import { Id as UserId } from '../../../domain/user/id';
import { Id as PersonId } from '../../../domain/person/id';
import { CreateMentorProfileEntity } from './create-mentor-profile.entity';
import { RegisterUserCommand } from '../../../application/command/register-user.command';
import { UserService } from '../../../infrastructure/service/user/user.service';
import { UserResource as Auth0UserResource } from '../../../infrastructure/resource/auth0/resources/user.resource';
import { AuthGuard } from '@nestjs/passport';
import { Auth0UserId } from '../../../infrastructure/resource/auth0/type/auth0-user-id';
import { JwtPayload as Auth0JwtPayload } from '../../../infrastructure/authentication/auth0/module/interface/jwt-payload.interface';
import { UserData } from '../../../infrastructure/service/user/type/user-data.type';
import { AppMetadata, User as Auth0User, UserMetadata } from 'auth0';
import { BadRequestException } from '../../../infrastructure/exception/bad-request.exception';
import { UserRole } from '../../../infrastructure/resource/auth0/roles';
import { CommandInterface } from '../../../application/interface/command.interface';
import { Id as MentorId } from '../../../domain/mentor/id';
import { CreateMentorProfileCommand } from '../../../application/command/create-mentor-profile.command';
import { validate } from 'typia';
import { RequestBodyValidationFailedException } from '../../../infrastructure/http/validation/exception/request-body-validation-failed.exception';
import { ensureContextIsValid } from './validation/context/validator.context';
import { ConflictException } from '../../../infrastructure/exception/conflict.exception';

@Controller(routesV1.mentor.root)
export class CreateMentorProfileHttpHandler {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly transactionDelegator: SequelizeTransactionDelegator,
    private readonly userService: UserService,
    private readonly auth0UserResource: Auth0UserResource,
  ) {}

  @UseGuards(AuthGuard())
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Request() request: ExpressRequest & { user: Auth0JwtPayload },
    @Body() body: CreateMentorProfileEntity,
  ) {
    this.ensureIsValidEntity(body);
    ensureContextIsValid(body);

    const user: Auth0JwtPayload = request.user;

    const auth0UserId = new Auth0UserId(user.sub);

    const authOUserData = await this.getAuth0UserData(auth0UserId);

    this.ensureUserHasVerifiedEmail(authOUserData);

    const userData = await this.ensureUserCanCreateMentorProfile(auth0UserId);

    const mentorId = await this.createMentorProfile(userData, authOUserData, body);

    await this.applyMentorRole(auth0UserId);

    const mentorProfile = await this.getCreatedMentorProfile(mentorId);
    return mentorProfile;
  }

  private async createMentorProfile(
    userData: UserData,
    authOUserData: Auth0User<UserMetadata, AppMetadata>,
    requestBodyPayload: CreateMentorProfileEntity,
  ) {
    let mentorId;

    if (!userData.hasUserAccount) {
      mentorId = await this.createAccountWithMentorProfileAndPerson(
        userData.auth0UserId,
        authOUserData,
        requestBodyPayload,
      );
      return mentorId;
    }

    mentorId = await this.createOnlyMentorProfileWithPerson(userData.user?.id, requestBodyPayload);
    return mentorId;
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
        'cannot create customer profile, user is not verified. You need to verify your email first.',
      );
    }
  }

  private async ensureUserCanCreateMentorProfile(auth0UserId: Auth0UserId): Promise<UserData> {
    const userData = await this.userService.getUserAccountData(auth0UserId);

    // If the user has already a customer account
    if (userData.hasUserAccount && userData.user.userType.value === UserRole.customer) {
      throw new ConflictException('cannot create mentor profile, the user is register as customer.');
    }

    // If the user has already a mentor account, with  and a customer profile set up
    if (userData.hasUserAccount && userData.profile.hasProfile && userData.profile.isMentor) {
      throw new ConflictException('cannot create customer profile, user already has a mentor profile.');
    }

    return userData;
  }

  private async createAccountWithMentorProfileAndPerson(
    auth0UserId: Auth0UserId,
    auth0UserData: Auth0User<UserMetadata, AppMetadata>,
    requestBodyPayload: CreateMentorProfileEntity,
  ) {
    const commands: CommandInterface[] = [];
    const userId = UserId.create();
    const personId = PersonId.create();

    const registerUserCommand = new RegisterUserCommand(
      userId.value,
      auth0UserData.email,
      UserRole.mentor,
      auth0UserId.value,
    );

    const createMentorProfileCommand = this.generateCreateMentorProfileCommand(requestBodyPayload, userId);
    const createPersonCommand = this.generateCreatePersonCommand(requestBodyPayload, userId, personId);

    commands.push(registerUserCommand, createMentorProfileCommand, createPersonCommand);
    await this.transactionDelegator.execute(commands);

    return new MentorId(createMentorProfileCommand.mentorId);
  }

  private async createOnlyMentorProfileWithPerson(userId: UserId, requestBodyPayload: CreateMentorProfileEntity) {
    const personId = PersonId.create();

    const createMentorProfileCommand = this.generateCreateMentorProfileCommand(requestBodyPayload, userId);

    const createPersonCommand = this.generateCreatePersonCommand(requestBodyPayload, userId, personId);

    await this.transactionDelegator.execute([createMentorProfileCommand, createPersonCommand]);

    return new MentorId(createMentorProfileCommand.mentorId);
  }

  private async applyMentorRole(auth0UserId: Auth0UserId) {
    await this.auth0UserResource.applyUserRoles(auth0UserId, [UserRole.mentor]);
  }

  private async getCreatedMentorProfile(mentorId: MentorId) {
    const getMentorQueryResult: Mentor[] = await this.queryBus.execute(new GetMentorByIdsQuery([mentorId.value]));

    const mentor: Mentor = getMentorQueryResult[0];

    return {
      id: mentor.id.value,
      profile_description: mentor.profileDescription,
      availability_type: mentor.availability.value,
      languages: mentor.languages.map((mentorLanguage) => ({
        language: mentorLanguage.value,
      })),
      course_type: mentor.trainingType.map((trainingType) => trainingType.value),
      profile_title: mentor.profileTitle,
      skills: mentor.skills.map((skill) => skill.name),
      experience_ids: mentor.professionalExperiences.map((experience) => experience.id.value),
      pricing_plans_ids: mentor.pricingPlans.map((pricingPlan) => pricingPlan.id.value),
    };
  }

  private generateCreateMentorProfileCommand(requestBodyPayload: CreateMentorProfileEntity, userId: UserId) {
    const mentorId = MentorId.create();

    const languageCodeStringArray = requestBodyPayload.languages.map((lang) => lang.language);
    return new CreateMentorProfileCommand(
      mentorId.value,
      userId.value,
      requestBodyPayload.profile_description,
      requestBodyPayload.availability_type,
      languageCodeStringArray,
      requestBodyPayload.course_type,
      requestBodyPayload.profile_title,
      requestBodyPayload.current_job_title,
      requestBodyPayload.skills,
      requestBodyPayload.display_nickname,
      requestBodyPayload.display_profile_photo,
      requestBodyPayload.display_location,
      requestBodyPayload.display_email,
      requestBodyPayload.display_phone_number,
      requestBodyPayload.display_linkedin,
      requestBodyPayload.display_current_job_title,
    );
  }

  private generateCreatePersonCommand(
    requestBodyPayload: CreateMentorProfileEntity,
    userId: UserId,
    personId: PersonId,
  ) {
    return new CreatePersonCommand(
      personId.value,
      userId.value,
      requestBodyPayload.firstname,
      requestBodyPayload.lastname,
      requestBodyPayload.phone_number,
      requestBodyPayload.location,
      requestBodyPayload.nickname,
      requestBodyPayload.linkedin,
    );
  }

  private ensureIsValidEntity(requestBodyPayload: CreateMentorProfileEntity) {
    const validationResult = validate<CreateMentorProfileEntity>(requestBodyPayload);
    if (!validationResult.success) {
      throw new RequestBodyValidationFailedException(validationResult.errors);
    }
  }
}
