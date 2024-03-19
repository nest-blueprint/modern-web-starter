import { InMemoryUserRepository } from '../../../../double/repository/in-memory-user-repository';
import { Test } from '@nestjs/testing';
import { GetUserByIdHandler } from '../../../../../src/application/query/handler/get-user-by-id.handler';
import { Id } from '../../../../../src/domain/user/id';
import { Uuid } from '../../../../../src/infrastructure/type/uuid.type';
import { Email } from '../../../../../src/domain/user/email';
import { User } from '../../../../../src/domain/user';
import { UserNotFoundException } from '../../../../../src/infrastructure/exception/user-not-found.exception';
import { UserCollectionToken } from '../../../../../src/infrastructure/repository/factory/token.factory';
import { GetUserByIdQuery } from '../../../../../src/application/query/get-user-by-id.query';
import { Type } from '../../../../../src/domain/user/type';
import { Auth0UserId } from '../../../../../src/infrastructure/resource/auth0/type/auth0-user-id';

describe('[Core/Application] GetUserByIdHandler', () => {
  let getUserHandler: GetUserByIdHandler;
  let userRepository: InMemoryUserRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [GetUserByIdHandler, { provide: UserCollectionToken, useClass: InMemoryUserRepository }],
    }).compile();

    getUserHandler = module.get(GetUserByIdHandler);
    userRepository = module.get(UserCollectionToken);
  });

  it('GetUserQueryHandler should be defined', () => {
    expect(getUserHandler).toBeDefined();
  });

  test('Return a user', async () => {
    const id = new Id(Uuid.random());
    const email = new Email('john.doe@gmail.com');
    const role = Type.fromString('customer');
    const user = User.create(id, email, role);
    const result = await userRepository.add(user);
    expect(result.isOk()).toBeTruthy();
    const query = new GetUserByIdQuery(result._unsafeUnwrap().id.value);
    const queryResult: User = await getUserHandler.execute(query);
    expect(queryResult).toBeDefined();
    expect(queryResult).toBeInstanceOf(User);
  });

  test('Try to return a user that does not exist in the collection', async () => {
    const id = new Id(Uuid.random());
    const query = new GetUserByIdQuery(id.value);
    await expect(async () => await getUserHandler.execute(query)).rejects.toThrow(UserNotFoundException);
  });
});
