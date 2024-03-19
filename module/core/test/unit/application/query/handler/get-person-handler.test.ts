import { Test } from '@nestjs/testing';
import { InMemoryPersonRepository } from '../../../../double/repository/in-memory-person.repository';
import { GetPersonByIdHandler } from '../../../../../src/application/query/handler/get-person-by-id.handler';
import { GetPersonQuery } from '../../../../../src/application/query/get-person.query';
import { PersonNotFoundException } from '../../../../../src/infrastructure/exception/person-not-found.exception';
import { Person } from '../../../../../src/domain/person';
import { PersonCollectionToken } from '../../../../../src/infrastructure/repository/factory/token.factory';
import { Id as UserId } from '../../../../../src/domain/user/id';

describe('[Core/Application] GetPersonHandler', () => {
  let personRepository: InMemoryPersonRepository;
  let getPersonHandler: GetPersonByIdHandler;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [GetPersonByIdHandler, { provide: PersonCollectionToken, useClass: InMemoryPersonRepository }],
    }).compile();

    personRepository = module.get(PersonCollectionToken);
    getPersonHandler = module.get(GetPersonByIdHandler);
  });

  it('GetPersonHandler should be defined and instanced', () => {
    expect(getPersonHandler).toBeDefined();
    expect(getPersonHandler).toBeInstanceOf(GetPersonByIdHandler);
  });

  it('PersonRepository should be defined and instanced', () => {
    expect(personRepository).toBeDefined();
    expect(personRepository).toBeInstanceOf(InMemoryPersonRepository);
  });

  test('Get a person, using id', async () => {
    const userId1 = UserId.create();
    const userId2 = UserId.create();
    const person = Person.create(userId1);
    const person2 = Person.create(userId2);
    const addPersonResult = await personRepository.add(person);

    expect(addPersonResult.isOk()).toBeTruthy();
    expect(addPersonResult._unsafeUnwrap()).toBeInstanceOf(Person);

    const getPersonQuery = new GetPersonQuery(person.id.value);

    const result: Person = await getPersonHandler.execute(getPersonQuery);
    expect(result).toBeInstanceOf(Person);
    expect(result.id.value).toEqual(person.id.value);

    const getPersonQuery2 = new GetPersonQuery(person2.id.value);
    await expect(async () => await getPersonHandler.execute(getPersonQuery2)).rejects.toThrow(PersonNotFoundException);
  });
});
