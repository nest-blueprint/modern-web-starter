import { Inject, Injectable } from '@nestjs/common';
import { Auth0UserId } from '../../../../../../../src/infrastructure/resource/auth0/type/auth0-user-id';
import { UserRole } from '../../../../../../../src/infrastructure/resource/auth0/roles';
import { Auth0UserResponse } from '../../type/auth0-user-response.type';
import { User } from '../../../../../../../src/domain/user';
import { Auth0FailureException } from '../../../../../../../src/infrastructure/resource/auth0/exception/auth0.failure.exception';
import { err, ok } from 'neverthrow';
import { Auth0Role } from '../../../../../../../src/infrastructure/resource/auth0/type/auth0-role';
import { randomAccessToken, randomBetween, randomIPV6 } from '../../util/auth0.util';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class InMemoryUserResource {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {
    this.permissions.set(UserRole.customer, ['read:personal-account', 'update:personal-account']);
    this.permissions.set(UserRole.mentor, [
      'read:personal-account',
      'update:personal-account',
      'create:public-profile',
    ]);
    this.permissions.set(UserRole.admin, ['read:accounts', 'update:accounts']);
  }

  users: Map<string, { user: User; role: UserRole | null }> = new Map(); // Map<Auth0UserId, { user: User, role: UserRole | null }>

  auth0Roles: Auth0Role[] = [
    {
      id: 'rol_123',
      name: 'admin',
      description: 'Admin role',
    },
    {
      id: 'rol_456',
      name: 'mentor',
      description: 'Mentor role',
    },
    {
      id: 'rol_789',
      name: 'customer',
      description: 'Customer role',
    },
  ];

  permissions: Map<UserRole, Array<string>> = new Map();

  async getUser(auth0Id: Auth0UserId) {
    this.logger.debug(`UserResource.getUser : retrieving user with auth0Id ${auth0Id.value}`);
    const userExistsResult = this.userExists(auth0Id);
    if (userExistsResult.isErr()) {
      return userExistsResult;
    }
    const userValue = userExistsResult.value;
    this.logger.debug(`UserResource.getUser : user with auth0Id ${auth0Id.value} found`);
    return ok(this.generateAuth0UserResponse(auth0Id, userValue.user));
  }

  async applyUserRoles(auth0Id: Auth0UserId, role: UserRole) {
    this.logger.debug(`UserResource.applyUserRoles : applying role ${role} to user with auth0Id ${auth0Id.value}`);
    const userExistsResult = this.userExists(auth0Id);
    if (userExistsResult.isErr()) {
      return userExistsResult;
    }
    const userValue = userExistsResult.value;
    userValue.role = role;
    this.logger.debug(`UserResource.applyUserRoles : role ${role} applied to user with auth0Id ${auth0Id.value}`);
    return ok(undefined);
  }

  async removeUserRole(auth0Id: Auth0UserId, roleName: UserRole) {
    this.logger.debug(
      `UserResource.removeUserRole : removing role ${roleName} from user with auth0Id ${auth0Id.value}`,
    );
    const userExistsResult = this.userExists(auth0Id);
    if (userExistsResult.isErr()) {
      return userExistsResult;
    }
    const userValue = userExistsResult.value;
    if (userValue.role !== roleName) {
      const auth0Error = new Auth0FailureException(`Cannot remove role ${roleName}, the user does not have this role.`);
      return err(auth0Error);
    }
    userValue.role = null;
    this.logger.debug(`UserResource.removeUserRole : success (auth0Id : ${auth0Id.value})`, {
      auth0Id: auth0Id.value,
      roleName,
    });
    return ok(undefined);
  }

  generateAuth0UserResponse(auth0Id: Auth0UserId, user: User): Auth0UserResponse {
    this.logger.debug(
      `UserResource.generateAuth0UserResponse : generating auth0 user response for user with auth0Id ${auth0Id.value}`,
    );
    return {
      created_at: new Date(Date.now()).toISOString(),
      email: user.email.value,
      email_verified: true,
      family_name: user.person?.lastname,
      given_name: user.person?.firstname,
      identities: [
        {
          provider: 'google-oauth2',
          access_token: randomAccessToken(),
          expires_in: 3599,
          user_id: auth0Id.value.split('|')[1],
          connection: 'google-oauth2',
          isSocial: true,
        },
      ],
      locale: 'en-GB',
      name:
        user.person?.firstname || user.person?.lastname
          ? `${user.person?.firstname} ${user.person?.lastname}`.trim()
          : undefined,
      nickname: `${user.person?.nickname ?? user.person?.firstname}`,
      picture: `https://randomuser.me/api/portraits/thumb/men/${randomBetween(1, 50)}.jpg`,
      updated_at: new Date(Date.now()).toISOString(),
      user_id: auth0Id.value,
      last_ip: randomIPV6(),
      last_login: new Date(Date.now()).toISOString(),
      logins_count: randomBetween(1, 50),
    };
  }

  private userExists(auth0Id: Auth0UserId) {
    this.logger.debug(`UserResource.userExists : checking if user with auth0Id ${auth0Id.value} exists`);
    const user = this.users.get(auth0Id.value);
    if (!user) {
      const auth0Error = new Auth0FailureException('Failed to retrieve user from auth0', {
        method: 'UserResource.getUser',
      });
      return err(auth0Error);
    }
    this.logger.debug(`UserResource.userExists : user with auth0Id ${auth0Id.value} exists`);
    return ok(user);
  }

  getUserRoles(auth0Id: Auth0UserId) {
    this.logger.debug(`UserResource.getUserRoles : retrieving roles for user with auth0Id ${auth0Id.value}`);
    const userExistsResult = this.userExists(auth0Id);
    if (userExistsResult.isErr()) {
      return userExistsResult;
    }
    const userValue = userExistsResult.value;
    const auth0Roles = this.auth0Roles.filter((role) => role.name === userValue.role);
    this.logger.debug(`UserResource.getUserRoles : roles for user with auth0Id ${auth0Id.value} retrieved`);
    return ok(auth0Roles);
  }

  getRolePermissions(roleName: UserRole) {
    this.logger.debug(`UserResource.getRolePermissions : retrieving permissions for role ${roleName}`);
    const permissions = this.permissions.get(roleName);
    if (!permissions) {
      const auth0Error = new Auth0FailureException('Failed to retrieve permissions from auth0', {
        method: 'UserResource.getRolePermissions',
      });
      return err(auth0Error);
    }
    this.logger.debug(`UserResource.getRolePermissions : permissions for role ${roleName} retrieved`);
    return ok(permissions);
  }

  getAuth0Roles() {
    this.logger.debug('UserResource.getAuth0Roles : retrieving auth0 roles');
    return ok(this.auth0Roles);
  }
}
