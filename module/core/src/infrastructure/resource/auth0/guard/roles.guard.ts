import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload as Auth0JwtPayload } from '../../../authentication/auth0/module/interface/jwt-payload.interface';
import { Auth0UserId } from '../type/auth0-user-id';
import { RuntimeErrorException } from '../../../exception/runtime-error.exception';
import { UserRole } from '../roles';
import { UserResource as Auth0UserResource } from '../resources/user.resource';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly reflector: Reflector,
    private readonly auth0: Auth0UserResource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requireRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user: Auth0JwtPayload = request.user;
    const userAuth0Id = new Auth0UserId(user.sub);

    const userRole = await this.matchRole(userAuth0Id, requireRoles as UserRole[]);

    return !!userRole;
  }

  private async matchRole(userAuth0Id: Auth0UserId, roles: UserRole[]): Promise<UserRole | null> {
    this.logger.debug(`matching auth0 role for user ${userAuth0Id.value} with roles ${roles.join(', ')}`, {
      userAuth0Id,
      roles,
    });
    const userRolesResult = await this.auth0.getUserRoles(userAuth0Id);

    if (userRolesResult.isErr()) {
      throw new RuntimeErrorException('Failed to get user roles.', {
        userAuth0Id,
        userRolesResult,
        method: 'RolesGuard.isUserHasRole',
      });
    }

    const userRolesValues = userRolesResult.value;
    const role = userRolesValues.find((auth0Role) => roles.includes(<UserRole>auth0Role.name));
    this.logger.debug(`matched auth0 role for user ${userAuth0Id.value} : ${role?.name}`, { role });
    return role ? <UserRole>role.name : null;
  }
}
