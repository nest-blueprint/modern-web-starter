import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { OpenApiExceptionFilter } from './module/core/src/infrastructure/filter/open-api-exception.filter';
import * as OpenApiValidator from 'express-openapi-validator';
import { ConfigLoaderServiceFactory } from './module/core/src/infrastructure/init/factory/config-loader-service.factory';
import { ConfigLoaderToken } from './module/core/src/infrastructure/init/token.init';
import { ConfigLoaderService } from './module/core/src/infrastructure/init/service/config-loader.service';
import { CreateCustomerProfileHttpHandler } from './module/core/src/presentation/v1/create-customer-profile/create-customer-profile.http-handler';
import { GetMentorHttpHandler } from './module/core/src/presentation/v1/get-mentor/get-mentor.http-handler';
import { GetPricingPlanHttpHandler } from './module/core/src/presentation/v1/get-pricing-plan/get-pricing-plan.http-handler';
import { GetProfessionalExperienceHttpHandler } from './module/core/src/presentation/v1/get-professional-experience/get-professional-experience.http-handler';
import { CreateProfessionalExperienceHttpHandler } from './module/core/src/presentation/v1/create-professional-experience/create-professional-experience.http-handler';
import { UserRepositoryFactory } from './module/core/src/infrastructure/repository/factory/user.repository.factory';
import { MentorRepositoryFactory } from './module/core/src/infrastructure/repository/factory/mentor.repository.factory';
import { PersonRepositoryFactory } from './module/core/src/infrastructure/repository/factory/person.repository.factory';
import { SkillRepositoryFactory } from './module/core/src/infrastructure/repository/factory/skill.repository.factory';
import { PricingPlanRepositoryFactory } from './module/core/src/infrastructure/repository/factory/pricing-plan.repository.factory';
import { ProfessionalExperienceRepositoryFactory } from './module/core/src/infrastructure/repository/factory/professional-experience.repository.factory';
import { SequelizeProvider } from './module/core/src/infrastructure/sequelize/sequelize.provider';
import { SequelizeTransactionDelegator } from './module/core/src/infrastructure/pattern-cqrs/delegator/sequelize-transaction.delegator';
import { CreateMentorProfileHandler } from './module/core/src/application/command/handler/create-mentor-profile.handler';
import { CreatePersonHandler } from './module/core/src/application/command/handler/create-person.handler';
import { CreateProfessionalExperienceHandler } from './module/core/src/application/command/handler/create-professional-experience.handler';
import { CreatePricingPlanHandler } from './module/core/src/application/command/handler/create-pricing-plan.handler';
import { GetUserByIdHandler } from './module/core/src/application/query/handler/get-user-by-id.handler';
import { GetMentorByIdsHandler } from './module/core/src/application/query/handler/get-mentor-by-ids.handler';
import { FindMentorIdsHandler } from './module/core/src/application/query/handler/find-mentor-ids.handler';
import { FindMentorMatchingCriteriaHandler } from './module/core/src/application/query/handler/find-mentor-matching-criteria.handler';
import { GetPricingPlanHandler } from './module/core/src/application/query/handler/get-pricing-plan.handler';
import { GetProfessionalExperienceHandler } from './module/core/src/application/query/handler/get-professional-experience.handler';
import { GetPersonByIdHandler } from './module/core/src/application/query/handler/get-person-by-id.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePricingPlanHttpHandler } from './module/core/src/presentation/v1/create-pricing-plan/create-pricing-plan.http-handler';
import { FooHttpHandler } from './module/core/src/presentation/v1/foo/foo.http-handler';
import { CreateMentorProfileHttpHandler } from './module/core/src/presentation/v1/create-mentor-profile/create-mentor-profile.http-handler';
import { UserService } from './module/core/src/infrastructure/service/user/user.service';
import { CustomerRepositoryFactory } from './module/core/src/infrastructure/repository/factory/customer.repository.factory';
import { PassportModule } from '@nestjs/passport';
import { UserResource } from './module/core/src/infrastructure/resource/auth0/resources/user.resource';
import { ManagementClientFactory } from './module/core/src/infrastructure/resource/auth0/factory/management-client.factory';
import { JwtStrategy } from './module/core/src/infrastructure/authentication/auth0/module/strategy/jwt.strategy';
import { RegisterUserHandler } from './module/core/src/application/command/handler/register-user.handler';
import { CreateCustomerProfileHandler } from './module/core/src/application/command/handler/create-customer-profile.handler';
import { GetCustomerProfileByIdHandler } from './module/core/src/application/query/handler/get-customer-profile-by-id.handler';
import { GetAccountDataHttpHandler } from './module/core/src/presentation/v1/get-account-data/get-account-data.http-handler';
import { WinstonModule } from 'nest-winston';
import winston from 'winston';

import { HttpLoggerMiddleware } from './module/core/src/infrastructure/middleware/http-logger.middleware';
import { getTransports } from './config/winston/winston';

const httpHandlers = [
  CreateCustomerProfileHttpHandler,
  CreateMentorProfileHttpHandler,
  GetMentorHttpHandler,
  GetPricingPlanHttpHandler,
  GetProfessionalExperienceHttpHandler,
  CreateProfessionalExperienceHttpHandler,
  CreatePricingPlanHttpHandler,
  FooHttpHandler,
  GetAccountDataHttpHandler,
];
const repositoryFactories = [
  UserRepositoryFactory,
  MentorRepositoryFactory,
  PersonRepositoryFactory,
  SkillRepositoryFactory,
  PricingPlanRepositoryFactory,
  ProfessionalExperienceRepositoryFactory,
  CustomerRepositoryFactory,
];

const servicesFactories = [ConfigLoaderServiceFactory];

const internalServices = [UserService];

const providers = [SequelizeProvider, SequelizeTransactionDelegator, JwtStrategy];

const externalProviders = [UserResource, ManagementClientFactory];

const commandHandlers = [
  RegisterUserHandler,
  CreateCustomerProfileHandler,
  CreateMentorProfileHandler,
  CreatePersonHandler,
  CreateProfessionalExperienceHandler,
  CreatePricingPlanHandler,
];
const queryHandlers = [
  GetUserByIdHandler,
  GetCustomerProfileByIdHandler,
  GetMentorByIdsHandler,
  FindMentorIdsHandler,
  FindMentorMatchingCriteriaHandler,
  GetPricingPlanHandler,
  GetProfessionalExperienceHandler,
  GetPersonByIdHandler,
];

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: ['jwt'] }),
    WinstonModule.forRoot({
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: getTransports(),
    }),
  ],
  controllers: [...httpHandlers],
  exports: [],
  providers: [
    { provide: APP_FILTER, useClass: OpenApiExceptionFilter },
    ConfigLoaderServiceFactory,
    ...repositoryFactories,
    ...servicesFactories,
    ...internalServices,
    ...providers,
    ...commandHandlers,
    ...queryHandlers,
    ...externalProviders,
  ],
})
export class AppModule implements NestModule {
  constructor(@Inject(ConfigLoaderToken) private readonly config: ConfigLoaderService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');

    consumer
      .apply(
        ...OpenApiValidator.middleware({
          apiSpec: this.config.get('application.API_SPECS'),
          validateRequests: this.config.get('application.OPENAPI_REQUEST_VALIDATION'),
          validateResponses: true,
        }),
      )
      .forRoutes('*');
  }
}
