import { RegisterUserHandler } from '../../../../../src/application/command/handler/register-user.handler';
import { Test } from '@nestjs/testing';
import { InMemoryUserRepository } from '../../../../double/repository/in-memory-user-repository';
import { RegisterUserCommand } from '../../../../../src/application/command/register-user.command';
import { Uuid } from '../../../../../src/infrastructure/type/uuid.type';
import { UserAlreadyExistsException } from '../../../../../src/infrastructure/exception/user-already-exists.exception';
import { UserCollectionToken } from '../../../../../src/infrastructure/repository/factory/token.factory';

describe('[Core/Application] RegisterUserHandler', () => {
  let registerUserHandler: RegisterUserHandler;
  let userRepository: InMemoryUserRepository;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [RegisterUserHandler, { provide: UserCollectionToken, useClass: InMemoryUserRepository }],
    }).compile();

    registerUserHandler = module.get(RegisterUserHandler);
    userRepository = module.get(UserCollectionToken);
  });

  beforeEach(() => {
    userRepository.clear();
  });

  it('RegiserUserHandler should be defined', () => {
    expect(registerUserHandler).toBeDefined();
    expect(registerUserHandler).toBeInstanceOf(RegisterUserHandler);
  });

  it('UserRepository should be defined', () => {
    expect(userRepository).toBeDefined();
    expect(userRepository).toBeInstanceOf(InMemoryUserRepository);
  });

  test('Register a new user', async () => {
    const countBefore = userRepository.count();

    const command = new RegisterUserCommand(Uuid.random(), 'john.doe@gmail.com', 'mentor', 'auth0|0123456789');
    await registerUserHandler.execute(command);
    expect(countBefore._unsafeUnwrap() + 1 === userRepository.count()._unsafeUnwrap()).toBeTruthy();
  });

  test('Register a new user, but with same credentials', async () => {
    const uuid = Uuid.random();
    const command = new RegisterUserCommand(uuid, 'john.doe@gmail.com', 'mentor', 'auth0|0123456789');
    await registerUserHandler.execute(command);

    // Test if the command throws an exception with the same user uuid
    const command2 = new RegisterUserCommand(uuid, 'john.smith@gmail.com', 'mentor', 'auth0|4163436789');
    await expect(async () => registerUserHandler.execute(command2)).rejects.toThrowError(UserAlreadyExistsException);

    // Test if the command throws an exception with the same email
    const command3 = new RegisterUserCommand(Uuid.random(), 'john.doe@gmail.com', 'customer', 'auth0|789409234');
    await expect(async () => registerUserHandler.execute(command3)).rejects.toThrowError(UserAlreadyExistsException);

    // Test if the command throws an exception with the same auth0 id
    const command4 = new RegisterUserCommand(Uuid.random(), 'alice.smith@gmail.com', 'customer', 'auth0|0123456789');
    await expect(async () => registerUserHandler.execute(command4)).rejects.toThrowError(UserAlreadyExistsException);
  });
});
