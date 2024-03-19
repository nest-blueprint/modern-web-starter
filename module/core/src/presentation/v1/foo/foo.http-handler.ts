import { Controller, Get, HttpCode, HttpStatus, Inject, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../../infrastructure/resource/auth0/decorator/roles.decorator';
import { UserRole } from '../../../infrastructure/resource/auth0/roles';
import { RolesGuard } from '../../../infrastructure/resource/auth0/guard/roles.guard';
import { UserResource as Auth0UserResource } from '../../../infrastructure/resource/auth0/resources/user.resource';
import { QueryBus } from '@nestjs/cqrs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { TypedQueryParam } from '../../../infrastructure/http/param/decorator/typed-param.decorator';

@Controller('/foo')
export class FooHttpHandler {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly userResource: Auth0UserResource,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async index(request: any, @TypedQueryParam({ name: 'bar', type: 'string' }) value: string) {
    //const queryArgs = new GetPersonQuery(randomUUID());
    //await this.queryBus.execute(queryArgs);
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(UserRole.customer)
  @Get('/protected')
  async protectedRoute(@Request() request: any) {
    console.log(request.user);
    return { message: 'protected' };
  }
}
