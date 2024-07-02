import { Test } from '@nestjs/testing';
import { CreatePersonHandler } from '../../../../../src/application/command/handler/create-person.handler';
import { InMemoryPersonRepository } from '../../../../double/repository/in-memory-person.repository';
import { CreatePersonCommand } from '../../../../../src/application/command/create-person.command';
import { PersonCollectionToken } from '../../../../../src/infrastructure/repository/factory/token.factory';
import { Person } from '../../../../../src/domain/person';
import { Id as UserId } from '../../../../../src/domain/user/id';
import { PersonAlreadyExistsException } from '../../../../../src/infrastructure/exception/person-already-exists.exception';

describe('[Core/Application] CreatePersonHandler', () => {
  let personRepository: InMemoryPersonRepository;
  let createPersonHandler: CreatePersonHandler;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        CreatePersonHandler,
        {
          provide: PersonCollectionToken,
          useClass: InMemoryPersonRepository,
        },
      ],
    }).compile();
    createPersonHandler = module.get(CreatePersonHandler);
    personRepository = module.get(PersonCollectionToken);
  });

  beforeEach(() => {
    personRepository.clear();
  });

  it('PersonRepository should be defined and instanced', () => {
    expect(personRepository).toBeDefined();
    expect(personRepository).toBeInstanceOf(InMemoryPersonRepository);
  });

  it('CreatePersonHandler should be defined', () => {
    expect(createPersonHandler).toBeDefined();
    expect(createPersonHandler).toBeInstanceOf(CreatePersonHandler);
  });

  test('Create a person', async () => {
    const userId = UserId.create();
    const person = Person.create(userId);

    const createPersonCommand = new CreatePersonCommand(person.id.value, userId.value);
    const countBefore = personRepository.count();
    await createPersonHandler.execute(createPersonCommand);
    const countAfter = personRepository.count();
    expect(countAfter).toEqual(countBefore + 1);
  });

  test('Create a person already registered in the repository', async () => {
    const userId = UserId.create();
    const person = Person.create(userId);
    const createPersonCommand = new CreatePersonCommand(person.id.value, userId.value);
    await createPersonHandler.execute(createPersonCommand);
    await expect(createPersonHandler.execute(createPersonCommand)).rejects.toThrowError(PersonAlreadyExistsException);
  });
});
