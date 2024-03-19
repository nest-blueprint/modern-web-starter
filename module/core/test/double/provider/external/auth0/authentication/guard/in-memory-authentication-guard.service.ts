import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InMemoryAuth0Service } from '../service/in-memory-auth0-users.service';
import { Auth0UserId } from '../../../../../../../src/infrastructure/resource/auth0/type/auth0-user-id';

@Injectable()
export class InMemoryAuthenticationGuard implements CanActivate {
  constructor(private readonly auth0: InMemoryAuth0Service) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auth0Id = new Auth0UserId(request.user.sub);
    return this.auth0.isLogged(auth0Id);
  }
}
