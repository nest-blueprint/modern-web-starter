import { InMemoryAuth0Service } from '../../../double/provider/external/auth0/authentication/service/in-memory-auth0-users.service';
import { InMemoryUserResource } from '../../../double/provider/external/auth0/authorization/resource/in-memory-user-resource';
import { InMemoryUserRepository } from '../../../double/repository/in-memory-user-repository';
import { InMemoryCustomerRepository } from '../../../double/repository/in-memory-customer.repository';
import { InMemoryPersonRepository } from '../../../double/repository/in-memory-person.repository';
import { InMemoryMentorRepository } from '../../../double/repository/in-memory-mentor.repository';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../../../../module';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { ConfigLoaderToken } from '../../../../src/infrastructure/init/token.init';
import { appConfig } from '../../../../../../config/autoload/app.config';
import { ConfigLoaderService } from '../../../../src/infrastructure/init/service/config-loader.service';
import { APP_FILTER } from '@nestjs/core';
import { OpenApiExceptionFilter } from '../../../../src/infrastructure/filter/open-api-exception.filter';
import { SequelizeToken } from '../../../../src/infrastructure/sequelize/token/sequelize.token';
import { SequelizeTransactionDelegator } from '../../../../src/infrastructure/pattern-cqrs/delegator/sequelize-transaction.delegator';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { TransactionDelegator } from '../../infrastructure/service/transaction-delegator.service';
import { RolesGuard } from '../../../../src/infrastructure/resource/auth0/guard/roles.guard';
import { RolesGuard as InMemoryRoleGuard } from '../../../double/provider/external/auth0/authorization/guard/in-memory-roles.guard';
import { UserResource } from '../../../../src/infrastructure/resource/auth0/resources/user.resource';
import { JwtStrategy } from '../../../../src/infrastructure/authentication/auth0/module/strategy/jwt.strategy';
import { LocalJwtStrategy } from '../../../double/provider/external/auth0/authentication/strategy/local-jwt.strategy';
import {
  CustomerCollectionToken,
  MentorCollectionToken,
  PersonCollectionToken,
  PricingPlanCollectionToken,
  ProfessionalExperienceCollectionToken,
  SkillCollectionToken,
  UserCollectionToken,
} from '../../../../src/infrastructure/repository/factory/token.factory';
import { InMemorySkillRepository } from '../../../double/repository/in-memory-skill.repository';
import { InMemoryPricingPlanRepository } from '../../../double/repository/in-memory-pricing-plan.repository';
import { InMemoryProfessionalExperienceRepository } from '../../../double/repository/in-memory-professional-experience.repository';
import { ExceptionInterceptor } from '../../../../src/infrastructure/interceptor/exception.interceptor';
import { HttpExceptionFilter } from '../../../../src/infrastructure/filter/http-exception.filter';
import { Auth0UserId } from '../../../../src/infrastructure/resource/auth0/type/auth0-user-id';
import { randomBetween, randomString } from '../../../double/provider/external/auth0/util/auth0.util';
import { Email } from '../../../../src/domain/user/email';
import { Id as UserId } from '../../../../src/domain/user/id';
import { Type as UserType } from '../../../../src/domain/user/type';
import { User } from '../../../../src/domain/user';
import { UserRole as Auth0UserRole } from '../../../../src/infrastructure/resource/auth0/roles';
import request from 'supertest';
import { routesV1 } from '../../../../config/routes-v1';

describe('[Core/Presentation] CreateCustomerProfileHttpHandler', () => {
  const auth0UserService = new InMemoryAuth0Service();

  let userResource: InMemoryUserResource;

  let userRepository: InMemoryUserRepository;
  let customerRepository: InMemoryCustomerRepository;
  let personRepository: InMemoryPersonRepository;

  let application: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, CqrsModule],
      providers: [
        {
          provide: ConfigLoaderToken,
          useFactory: () => {
            const config = appConfig();
            return new ConfigLoaderService(config);
          },
        },
        { provide: APP_FILTER, useClass: OpenApiExceptionFilter },
      ],
    })
      .overrideProvider(SequelizeToken)
      .useValue(null)
      .overrideProvider(SequelizeTransactionDelegator)
      .useFactory({
        inject: [CommandBus, WINSTON_MODULE_PROVIDER],
        factory: (commandBus: CommandBus, logger: Logger) => {
          return new TransactionDelegator(logger, commandBus);
        },
      })
      .overrideProvider(RolesGuard)
      .useClass(InMemoryRoleGuard)
      .overrideProvider(UserResource)
      .useClass(InMemoryUserResource)
      .overrideProvider(JwtStrategy)
      .useFactory({
        inject: [WINSTON_MODULE_PROVIDER],
        factory: (logger: Logger) => new LocalJwtStrategy(logger, auth0UserService),
      })
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
      .compile();

    application = module.createNestApplication();

    userResource = module.get(UserResource);

    userRepository = module.get(UserCollectionToken);
    customerRepository = module.get(CustomerCollectionToken);
    personRepository = module.get(PersonCollectionToken);

    const config = module.get(ConfigLoaderToken);
    const logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);

    application.useGlobalInterceptors(new ExceptionInterceptor(logger, config));
    application.useGlobalFilters(new HttpExceptionFilter(logger, config));

    await application.init();
  });

  afterEach(() => {
    auth0UserService.logOutAll();
    auth0UserService.removeAllUsers();
    userRepository.clear();
    personRepository.clear();
    customerRepository.clear();
  });

  test('Request /customer (POST) with user account created, but not logged in', async () => {
    const auth0UserId = new Auth0UserId(`auth0|${randomBetween(10000000, 99999999)}`);
    const email = Email.fromString('john.doe@example.com');
    const userId = UserId.create();
    const userType = UserType.fromString(UserType.Customer);

    const user = User.create(userId, email, userType);

    // Add user to auth0 stub (fake auth0 service). It is now possible to log in with this user
    auth0UserService.addUser(auth0UserId, user);

    // Also, we need add user in the Auth0Management stub service (UserResource), because it is used to match the user with the application account and check roles
    userResource.users.set(auth0UserId.value, { user, role: Auth0UserRole.customer });

    // Create the user account in the application
    userRepository.add(user, auth0UserId);
    expect(userRepository.count()._unsafeUnwrap()).toBe(1);

    const response = await request(application.getHttpServer())
      .post(routesV1.customer.register)
      .set('Authorization', `Bearer ${randomString(50, 'abcdefghijklmnopqrstuvwxyz0123456789')}`)
      .send();

    expect(response.status).toBe(401);
    expect(response.body.detail).toBeDefined();
    expect(response.body.detail).toContain('invalid authentication credentials');
  });

  test('Request /customer (POST) with bad or invalid header: authorization JWT token', async () => {});

  test('Request /customer (POST) with invalid request payload', async () => {});

  test('Request /customer (POST), with correct payload', async () => {
    const auth0UserId = new Auth0UserId(`auth0|${randomBetween(10000000, 99999999)}`);
    const email = Email.fromString('john.doe@example.com');
    const userId = UserId.create();
    const userType = UserType.fromString(UserType.Customer);

    const user = User.create(userId, email, userType);

    // Add user to auth0 stub (fake auth0 service). It is now possible to log in with this user
    auth0UserService.addUser(auth0UserId, user);

    // Also, we need add user in the Auth0Management stub service (UserResource), because it is used to match the user with the application account and check roles
    userResource.users.set(auth0UserId.value, { user, role: Auth0UserRole.customer });

    // Create the user account in the application
    userRepository.add(user, auth0UserId);
    expect(userRepository.count()._unsafeUnwrap()).toBe(1);

    const accessToken = auth0UserService.logIn(auth0UserId);

    const data = {
      type: 'individual',
    };

    const response = await request(application.getHttpServer())
      .post(routesV1.customer.register)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(data);

    expect(response.status).toBe(201);
  });
});
