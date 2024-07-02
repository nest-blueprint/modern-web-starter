import { Inject, Injectable } from '@nestjs/common';
import {
  CustomerCollectionToken,
  MentorCollectionToken,
  UserCollectionToken,
} from '../../repository/factory/token.factory';
import { UserRepository } from '../../repository/user.repository';
import { Auth0UserId } from '../../resource/auth0/type/auth0-user-id';
import { UserData } from './type/user-data.type';
import { Id as CustomerId } from '../../../domain/customer/id';
import { Id as MentorId } from '../../../domain/mentor/id';
import { Id as UserId } from '../../../domain/user/id';
import { UserNotFoundException } from '../../exception/user-not-found.exception';
import { MentorRepository } from '../../repository/mentor.repository';
import { CustomerRepository } from '../../repository/customer.repository';
import { match } from '../../util/function.util';
import { AuthenticationFailureException } from '../../exception/authentication-failure.exception';
import { MentorNotFoundException } from '../../exception/mentor-not-found.exception';
import { Type } from '../../../domain/user/type';
import { RuntimeErrorException } from '../../exception/runtime-error.exception';
import { UserServiceInterface } from './user-service.interface';
import { CustomerNotFoundException } from '../../exception/customer-not-found.exception';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(UserCollectionToken) private readonly users: UserRepository,
    @Inject(MentorCollectionToken) private readonly mentors: MentorRepository,
    @Inject(CustomerCollectionToken) private readonly customers: CustomerRepository,
  ) {}

  async getUserAccountData(auth0UserId: Auth0UserId): Promise<UserData> {
    this.logger.debug('UserService.getUserAccountData', { auth0UserId });
    const userResult = await this.users.getUserByAuth0Id(auth0UserId);

    if (userResult.isErr()) {
      if (userResult.error instanceof UserNotFoundException) {
        return {
          hasUserAccount: false,
          auth0UserId,
          user: null,
          profile: {
            profileData: null,
            isCustomer: false,
            isMentor: false,
            hasProfile: false,
          },
        };
      }
      throw userResult.error;
    }

    const userType = userResult.value.userType;

    if (userType.value === Type.Customer) {
      const customerResult = await this.customers.getByUserId(userResult.value.id);

      if (customerResult.isErr() && !(customerResult.error instanceof CustomerNotFoundException)) {
        throw customerResult.error;
      }

      if (customerResult.isErr() && customerResult.error instanceof CustomerNotFoundException) {
        return {
          hasUserAccount: true,
          auth0UserId,
          user: userResult.value,
          profile: {
            profileData: customerResult.unwrapOr(null),
            isCustomer: true,
            isMentor: false,
            hasProfile: false,
          },
        };
      }

      if (customerResult.isOk()) {
        return {
          hasUserAccount: true,
          auth0UserId,
          user: userResult.value,
          profile: {
            profileData: customerResult.value,
            isCustomer: true,
            isMentor: false,
            hasProfile: true,
          },
        };
      }
    }

    if (userType.value === Type.Mentor) {
      const mentorResult = await this.mentors.getMentorByUserId(userResult.value.id);

      if (mentorResult.isErr() && !(mentorResult.error instanceof MentorNotFoundException)) {
        throw mentorResult.error;
      }

      if (mentorResult.isErr() && mentorResult.error instanceof MentorNotFoundException)
        return {
          hasUserAccount: true,
          auth0UserId,
          user: userResult.value,
          profile: {
            profileData: mentorResult.unwrapOr(null),
            isCustomer: false,
            isMentor: true,
            hasProfile: false,
          },
        };

      if (mentorResult.isOk()) {
        return {
          hasUserAccount: true,
          auth0UserId,
          user: userResult.value,
          profile: {
            profileData: mentorResult.value,
            isCustomer: false,
            isMentor: true,
            hasProfile: true,
          },
        };
      }
    }

    throw new RuntimeErrorException(`Operation failed. User role is invalid`);
  }

  async ensureAuth0IdIsMatchingUserAccount(auth0UserId: Auth0UserId, id: CustomerId | MentorId | UserId) {
    this.logger.debug('UserService.ensureAuth0IdIsMatchingUserAccount', { auth0UserId });
    const userResult = await this.users.getUserByAuth0Id(auth0UserId);
    if (userResult.isErr()) {
      if (userResult.error instanceof UserNotFoundException) {
        throw new AuthenticationFailureException('Authentication is invalid or failed.');
      }
      throw userResult.error;
    }

    if (id instanceof UserId) return;

    if (id instanceof MentorId) {
      const mentorResult = await this.mentors.getMentorByUserId(userResult.value.id);

      return match(mentorResult, {
        success: () =>
          this.logger.debug('UserService.ensureAuth0IdIsMatchingUserAccount : success (mentor found)', { auth0UserId }),
        failure: () => {
          throw new MentorNotFoundException(`Operation failed. No  mentor profile found for the user`);
        },
      });
    }

    if (id instanceof CustomerId) {
      const customerResult = await this.customers.getByUserId(userResult.value.id);
      return match(customerResult, {
        success: () =>
          this.logger.debug('UserService.ensureAuth0IdIsMatchingUserAccount : success (found customer)', {
            auth0UserId,
          }),
        failure: () => {
          throw new MentorNotFoundException(`Operation failed. No customer profile found for the user`);
        },
      });
    }
  }
}
