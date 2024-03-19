import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigLoaderToken } from '../../../../init/token.init';
import { ConfigLoaderService } from '../../../../init/service/config-loader.service';
import { JwtPayload } from '../interface/jwt-payload.interface';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(ConfigLoaderToken) private readonly config: ConfigLoaderService,
  ) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: new URL(`https://${config.get('auth0.domain')}/.well-known/jwks.json`).href,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: `${config.get('auth0.audience')}`,
      issuer: new URL(`${config.get('auth0.issuerUrl')}`).href,
    });
  }

  validate(payload: JwtPayload) {
    this.logger.debug('JwtStrategy.validate : execute');
    const minimumScope = ['openid', 'profile', 'email'];
    if (payload?.scope?.split(' ').filter((scope) => minimumScope.indexOf(scope) > -1).length !== 3) {
      throw new UnauthorizedException('JWT does not possess the required scope (`openid profile email`).');
    }
    this.logger.debug('JwtStrategy.validate : success');
    return payload;
  }
}
