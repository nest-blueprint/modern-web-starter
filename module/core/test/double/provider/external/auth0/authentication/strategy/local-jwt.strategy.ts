import { BadRequestException, Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InMemoryAuth0Service } from '../service/in-memory-auth0-users.service';
import { Auth0UserId } from '../../../../../../../src/infrastructure/resource/auth0/type/auth0-user-id';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET } from '../../constant.auth0';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

export class LocalJwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly auth0: InMemoryAuth0Service,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    });
  }

  validate(payload) {
    this.logger.debug('LocalJwtStrategy.validate', { payload });
    let isLogged = false;
    let auth0UserId;
    try {
      auth0UserId = new Auth0UserId(payload.user_id);
    } catch (error: any) {
      throw new BadRequestException('Cannot parse authentication Id.Invalid authentication token.');
    }

    isLogged = this.auth0.isLogged(auth0UserId);

    if (!isLogged) {
      this.logger.debug('LocalJwtStrategy.validate : user not logged in', { payload });
      throw new UnauthorizedException('You need to be logged in to access this resource.');
    }
    this.logger.debug('LocalJwtStrategy.validate : used logged in', { payload });

    const generatedUserPayload = this.auth0.generateUserLoggedPayload(auth0UserId);
    this.logger.debug(`LocalJwtStrategy.validate : generatedUserPayload - ${JSON.stringify(generatedUserPayload)}`, {
      generatedUserPayload,
    });
    return this.auth0.generateUserLoggedPayload(auth0UserId);
  }
}
