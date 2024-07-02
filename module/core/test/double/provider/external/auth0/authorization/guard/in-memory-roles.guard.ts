import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtPayload as Auth0JwtPayload } from '../../../../../../../src/infrastructure/authentication/auth0/module/interface/jwt-payload.interface';
import { Reflector } from '@nestjs/core';
import { InMemoryUserResource as InMemoryAuth0UserResource } from '../resource/in-memory-user-resource';
import { Auth0UserId } from '../../../../../../../src/infrastructure/resource/auth0/type/auth0-user-id';
import { UserRole } from '../../../../../../../src/infrastructure/resource/auth0/roles';
import { RuntimeErrorException } from '../../../../../../../src/infrastructure/exception/runtime-error.exception';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly auth0: InMemoryAuth0UserResource) {}

  canActivate(context: ExecutionContext): boolean {
    const requireRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requireRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user: Auth0JwtPayload = request.user;
    const userAuth0Id = new Auth0UserId(user.sub);

    const userRole = this.matchRole(userAuth0Id, requireRoles as UserRole[]);

    return !!userRole;
  }

  private matchRole(userAuth0Id: Auth0UserId, roles: UserRole[]) {
    const userRolesResult = this.auth0.getUserRoles(userAuth0Id);

    if (userRolesResult.isErr()) {
      throw new RuntimeErrorException('Failed to get user roles.', {
        userAuth0Id,
        userRolesResult,
        method: 'RolesGuard.matchRole',
      });
    }

    const userRolesValues = userRolesResult.value;
    const role = userRolesValues.find((auth0Role) => roles.includes(<UserRole>auth0Role.name));
    return role ? <UserRole>role.name : null;
  }
}
