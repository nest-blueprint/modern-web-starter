import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { AppModule } from '../../../module';
import { ConfigLoaderToken } from '../src/infrastructure/init/token.init';
import { SequelizeTransactionDelegator } from '../src/infrastructure/pattern-cqrs/delegator/sequelize-transaction.delegator';
import { ConfigLoaderService } from '../src/infrastructure/init/service/config-loader.service';
import { appConfig } from '../../../config/autoload/app.config';
import { SequelizeToken } from '../src/infrastructure/sequelize/token/sequelize.token';
import {
  CustomerCollectionToken,
  MentorCollectionToken,
  PersonCollectionToken,
  PricingPlanCollectionToken,
  ProfessionalExperienceCollectionToken,
  SkillCollectionToken,
  UserCollectionToken,
} from '../src/infrastructure/repository/factory/token.factory';
import { InMemoryUserRepository } from '../test/double/repository/in-memory-user-repository';
import { InMemoryMentorRepository } from '../test/double/repository/in-memory-mentor.repository';
import { InMemoryPersonRepository } from '../test/double/repository/in-memory-person.repository';
import { InMemorySkillRepository } from '../test/double/repository/in-memory-skill.repository';
import { InMemoryPricingPlanRepository } from '../test/double/repository/in-memory-pricing-plan.repository';
import { InMemoryProfessionalExperienceRepository } from '../test/double/repository/in-memory-professional-experience.repository';
import { TransactionDelegator } from '../test/unit/infrastructure/service/transaction-delegator.service';
import { InMemoryCustomerRepository } from '../test/double/repository/in-memory-customer.repository';
import { InMemoryAuth0Service } from '../test/double/provider/external/auth0/authentication/service/in-memory-auth0-users.service';
import { RolesGuard as InMemoryRoleGuard } from '../test/double/provider/external/auth0/authorization/guard/in-memory-roles.guard';
import { RolesGuard } from '../src/infrastructure/resource/auth0/guard/roles.guard';
import { JwtStrategy } from '../src/infrastructure/authentication/auth0/module/strategy/jwt.strategy';
import { LocalJwtStrategy } from '../test/double/provider/external/auth0/authentication/strategy/local-jwt.strategy';
import { UserResource } from '../src/infrastructure/resource/auth0/resources/user.resource';
import { InMemoryUserResource } from '../test/double/provider/external/auth0/authorization/resource/in-memory-user-resource';
import { Context } from './context/context';
import { WINSTON_MODULE_PROVIDER, WinstonModule } from 'nest-winston';
import winston, { Logger } from 'winston';
import { ExceptionInterceptor } from '../src/infrastructure/interceptor/exception.interceptor';
import { HttpExceptionFilter } from '../src/infrastructure/filter/http-exception.filter';
const getTestingModule = async () => {
  //Load in-memory services
  Context.sharedContext.services.auth0 = new InMemoryAuth0Service();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      AppModule,
      CqrsModule,
      WinstonModule.forRoot({
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        transports: [new winston.transports.Console()],
      }),
    ],
    providers: [],
  })
    .overrideProvider(ConfigLoaderToken)
    .useFactory({
      factory: () => {
        const config = appConfig();
        return new ConfigLoaderService(config);
      },
    })
    .overrideProvider(SequelizeTransactionDelegator)
    .useFactory({
      inject: [WINSTON_MODULE_PROVIDER, CommandBus],
      factory: (logger: Logger, commandBus: CommandBus) => {
        return new TransactionDelegator(logger, commandBus);
      },
    })
    .overrideProvider(SequelizeToken)
    .useValue(null)
    .overrideProvider(UserCollectionToken)
    .useFactory({
      inject: [WINSTON_MODULE_PROVIDER],
      factory: (logger: Logger) => new InMemoryUserRepository(logger),
    })
    .overrideProvider(MentorCollectionToken)
    .useFactory({
      inject: [WINSTON_MODULE_PROVIDER],
      factory: (logger: Logger) => new InMemoryMentorRepository(logger),
    })
    .overrideProvider(PersonCollectionToken)
    .useFactory({
      inject: [WINSTON_MODULE_PROVIDER],
      factory: (logger: Logger) => new InMemoryPersonRepository(logger),
    })
    .overrideProvider(SkillCollectionToken)
    .useFactory({
      inject: [WINSTON_MODULE_PROVIDER],
      factory: (logger: Logger) => new InMemorySkillRepository(),
    })
    .overrideProvider(PricingPlanCollectionToken)
    .useFactory({
      inject: [WINSTON_MODULE_PROVIDER],
      factory: (logger: Logger) => new InMemoryPricingPlanRepository(),
    })
    .overrideProvider(ProfessionalExperienceCollectionToken)
    .useFactory({
      inject: [WINSTON_MODULE_PROVIDER],
      factory: (logger: Logger) => new InMemoryProfessionalExperienceRepository(),
    })
    .overrideProvider(CustomerCollectionToken)
    .useFactory({
      inject: [WINSTON_MODULE_PROVIDER],
      factory: (logger: Logger) => new InMemoryCustomerRepository(logger),
    })
    .overrideProvider(RolesGuard)
    .useClass(InMemoryRoleGuard)
    .overrideProvider(UserResource)
    .useClass(InMemoryUserResource)
    .overrideProvider(JwtStrategy)
    .useFactory({
      inject: [WINSTON_MODULE_PROVIDER],
      factory: (logger: Logger) => new LocalJwtStrategy(logger, Context.sharedContext.services.auth0),
    })
    .compile();

  return moduleFixture;
};

export const initApplication = async () => {
  const module = await getTestingModule();
  const app = module.createNestApplication();

  const config = module.get(ConfigLoaderToken);
  const logger = module.get(WINSTON_MODULE_PROVIDER);

  app.useGlobalInterceptors(new ExceptionInterceptor(logger, config));
  app.useGlobalFilters(new HttpExceptionFilter(logger, config));

  Context.sharedContext.repositories.user = module.get(UserCollectionToken);
  Context.sharedContext.repositories.mentor = module.get(MentorCollectionToken);
  Context.sharedContext.repositories.person = module.get(PersonCollectionToken);
  Context.sharedContext.repositories.skill = module.get(SkillCollectionToken);
  Context.sharedContext.repositories.pricingPlan = module.get(PricingPlanCollectionToken);
  Context.sharedContext.repositories.professionalExperience = module.get(ProfessionalExperienceCollectionToken);
  Context.sharedContext.repositories.customer = module.get(CustomerCollectionToken);

  Context.sharedContext.resources.userResource = module.get(UserResource);

  await app.init();

  return app;
};
