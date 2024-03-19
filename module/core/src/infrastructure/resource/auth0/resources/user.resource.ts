import { Inject, Injectable } from '@nestjs/common';
import { AppMetadata, ManagementClient, Permission, Role, User, UserMetadata } from 'auth0';
import { err, ok, Result } from 'neverthrow';
import { Auth0FailureException } from '../exception/auth0.failure.exception';
import { ManagementClientToken } from '../token';
import { ConfigLoaderToken } from '../../../init/token.init';
import { ConfigLoaderService } from '../../../init/service/config-loader.service';
import { UserRole } from '../roles';
import { Auth0UserId } from '../type/auth0-user-id';
import { RuntimeErrorException } from '../../../exception/runtime-error.exception';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class UserResource {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(ManagementClientToken) private readonly managementClient: ManagementClient,
    @Inject(ConfigLoaderToken) private readonly config: ConfigLoaderService,
  ) {}

  async getUser(auth0Id: Auth0UserId): Promise<Result<User<AppMetadata, UserMetadata>, Error>> {
    this.logger.debug(`[Auth0] User.Resource.getUser`, auth0Id);
    return new Promise((resolve, reject) => {
      this.managementClient.getUser({ id: auth0Id.value }, (error, user) => {
        if (error) {
          const auth0Error = new Auth0FailureException('Failed to retrieve user from auth0', {
            method: 'UserResource.getUser',
            error,
          });
          const resultError = err(auth0Error);
          reject(resultError);
        }
        const resultUser = ok(user);
        this.logger.debug(`[Auth0] User.Resource.getUser : successful`, auth0Id);
        resolve(resultUser);
      });
    });
  }

  async applyUserRoles(auth0Id: Auth0UserId, roleNames: UserRole[]) {
    this.logger.debug(`[Auth0] User.Resource.applyUserRoles`, auth0Id, roleNames);
    return new Promise(async (resolve, reject) => {
      const roles = await Promise.all(roleNames.map((role) => this.getAuth0RoleIdFromName(role)));

      if (roles.some((role) => role.isErr())) {
        const errorResult = err(roles.find((role) => role.isErr()));
        reject(errorResult);
      }
      //@ts-expect-error - we know that all roles are ok
      const roleRawValues = roles.map((role) => role.value);

      this.managementClient.assignRolestoUser({ id: auth0Id.value }, { roles: roleRawValues }, (error) => {
        if (error) {
          const auth0Error = new Auth0FailureException('Failed to assign roles to user', {
            method: 'UserResource.applyUserRoles',
            error,
          });
          const resultError = err(auth0Error);
          reject(resultError);
        }
        this.logger.debug(`[Auth0] User.Resource.applyUserRoles : successful`, auth0Id, roleNames);
        resolve(ok(undefined));
      });
    });
  }

  async removeUserRole(authOId: Auth0UserId, roleName: UserRole) {
    this.logger.debug(`[Auth0] User.Resource.removeUserRole`, authOId, roleName);
    return new Promise(async (resolve, reject) => {
      const roleResult = await this.getAuth0RoleIdFromName(roleName);
      if (roleResult.isErr()) {
        reject(roleResult.error);
      }
      //@ts-expect-error - we know that roleResult is ok
      const roleId = roleResult.value;

      this.managementClient.removeRolesFromUser({ id: authOId.value }, { roles: [roleId.value] }, (error) => {
        if (error) {
          const auth0Error = new Auth0FailureException('Failed to remove role from user', {
            method: ' UserResource.removeUserRole',
            error,
          });
          const resultError = err(auth0Error);
          reject(resultError);
        }
        this.logger.debug(`[Auth0] User.Resource.removeUserRole : successful`, authOId, roleName);
        return ok(undefined);
      });
    });
  }

  async getUserRoles(auth0: Auth0UserId): Promise<Result<Role[], Error>> {
    this.logger.debug(`[Auth0] User.Resource.getUserRoles`, auth0);
    return new Promise((resolve, reject) => {
      this.managementClient.getUserRoles({ id: auth0.value }, (error, roles) => {
        if (error) {
          const auth0Error = new Auth0FailureException('Failed to retrieve user roles', {
            method: 'UserResource.getUserRoles',
            error,
          });
          const resultError = err(auth0Error);
          reject(resultError);
        }
        const resultRoles = ok(roles);
        this.logger.debug(`[Auth0] User.Resource.getUserRoles : successful`, auth0);
        resolve(resultRoles);
      });
    });
  }

  async getRolePermissions(role: UserRole): Promise<Result<Permission[], Error>> {
    this.logger.debug(`[Auth0] User.Resource.getRolePermissions`, role);
    return new Promise(async (resolve, reject) => {
      const roleIdResult = await this.getAuth0RoleIdFromName(role);
      if (roleIdResult.isErr()) {
        reject(roleIdResult.error);
      }
      //@ts-expect-error - we know that roleIdResult is ok
      const roleIdValue = roleIdResult.value;
      this.managementClient.getPermissionsInRole({ id: roleIdValue }, (error, permissions) => {
        if (error) {
          const auth0Error = new Auth0FailureException('Failed to retrieve role permissions', {
            method: 'UserResource.getRolePermissions',
            error,
          });
          const resultError = err(auth0Error);
          reject(resultError);
        }
        const resultPermissions = ok(permissions);
        this.logger.debug(`[Auth0] User.Resource.getRolePermissions : successful`, role);
        resolve(resultPermissions);
      });
    });
  }

  async getAuth0Roles(): Promise<Result<Role[], Error>> {
    this.logger.debug(`[Auth0] User.Resource.getAuth0Roles`);
    return new Promise((resolve, reject) => {
      this.managementClient.getRoles((error, roles) => {
        if (error) {
          const auth0Error = new Auth0FailureException('Failed to retrieve roles', {
            method: 'UserResource.getAuth0Roles',
            error,
          });
          const resultError = err(auth0Error);
          reject(resultError);
        }
        const resultRoles = ok(roles);
        this.logger.debug(`[Auth0] User.Resource.getAuth0Roles : successful`);
        resolve(resultRoles);
      });
    });
  }

  async getAuth0RoleIdFromName(roleName: UserRole): Promise<Result<string, Error>> {
    this.logger.debug(`[Auth0] User.Resource.getAuth0RoleIdFromName`, roleName);
    const rolesResult = await this.getAuth0Roles();
    if (rolesResult.isErr()) {
      return err(rolesResult.error);
    }

    const rolesValue = rolesResult.value;
    const role = rolesValue.find((role) => role.name === roleName);

    if (!role) {
      const error = new RuntimeErrorException('Role not found', {
        method: 'UserResource.getUserRoleIdFromName',
        roleName,
      });
      return err(error);
    }
    this.logger.debug(`[Auth0] User.Resource.getAuth0RoleIdFromName : successful`, roleName);
    return ok(role.id);
  }
}
