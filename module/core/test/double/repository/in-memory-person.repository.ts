import { PersonCollection } from '../../../src/domain/collection/person.collection';
import { Person } from '../../../src/domain/person';
import { Id as PersonId } from '../../../src/domain/person/id';
import { err, ok, Result } from 'neverthrow';
import { PersonAlreadyExistsException } from '../../../src/infrastructure/exception/person-already-exists.exception';
import { PersonNotFoundException } from '../../../src/infrastructure/exception/person-not-found.exception';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

export class InMemoryPersonRepository implements PersonCollection {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}
  private persons: Map<string, Person> = new Map();

  add(person: Person): Result<Person, Error> {
    this.logger.debug(`InMemoryPersonRepository.add : execute - ${person.id.value}`, { person });
    if (!this.canBeAdded(person)) {
      this.logger.debug(`InMemoryPersonRepository.add : failure - person already exists`, { person });
      return err(new PersonAlreadyExistsException());
    }
    this.persons.set(person.id.value, person);
    this.logger.debug(`InMemoryPersonRepository.add : success`, { person });
    this.logger.debug(`InMemoryPersonRepository: contains ${this.persons.size}`, { persons: this.persons });
    return ok(person);
  }

  delete(id: PersonId): Result<Person, Error> {
    this.logger.debug(`InMemoryPersonRepository.delete : execute - ${id.value}`, { id });

    if (!this.persons.has(id.value)) {
      this.logger.debug(`InMemoryPersonRepository.delete : failure - person not found`, { id });
      return err(new PersonNotFoundException());
    }
    const person = this.persons.get(id.value);
    this.persons.delete(id.value);
    this.logger.debug(`InMemoryPersonRepository.delete : success`, { id });
    this.logger.debug(`InMemoryPersonRepository: contains ${this.persons.size}`, { persons: this.persons });
    return ok(person);
  }

  get(id: PersonId): Result<Person, Error> {
    this.logger.debug(`InMemoryPersonRepository.get : execute - ${id.value}`, { id });

    if (!this.persons.has(id.value)) {
      this.logger.debug(`InMemoryPersonRepository.get : failure - person not found`, { id });
      return err(new PersonNotFoundException());
    }
    const person = this.persons.get(id.value);
    this.logger.debug(`InMemoryPersonRepository.get : success`, { id });
    this.logger.debug(`InMemoryPersonRepository: contains ${this.persons.size}`, { persons: this.persons });
    return ok(person);
  }

  update(person: Person): Result<Person, Error> {
    this.logger.debug(`InMemoryPersonRepository.update : execute - ${person.id.value}`, { person });
    this.logger.debug(`InMemoryPersonRepository: contains ${this.persons.size}`, { persons: this.persons });
    if (!this.persons.has(person.id.value)) {
      this.logger.debug(`InMemoryPersonRepository.update : failure - person not found`, { person });
      return err(new PersonNotFoundException());
    }
    this.persons.set(person.id.value, person);
    this.logger.debug(`InMemoryPersonRepository.update : success`, { person });
    this.logger.debug(`InMemoryPersonRepository: contains ${this.persons.size}`, { persons: this.persons });
    return ok(person);
  }

  clear(): void {
    this.logger.debug(`InMemoryPersonRepository.clear : execute`);
    this.persons.clear();
  }

  count(): number {
    this.logger.debug(`InMemoryPersonRepository.count : execute`);
    this.logger.debug(`InMemoryPersonRepository: contains ${this.persons.size}`, { persons: this.persons });
    return this.persons.size;
  }

  private canBeAdded(person: Person): boolean {
    this.logger.debug(`InMemoryPersonRepository.canBeAdded : execute - ${person.id.value}`, { person });

    const foundPerson = [...this.persons.values()].find((storedPerson) => {
      return storedPerson.userId.value === person.userId.value || storedPerson.id.value === person.id.value;
    });
    this.logger.debug(`InMemoryPersonRepository.canBeAdded : ${!foundPerson}`, { foundPerson });
    this.logger.debug(`InMemoryPersonRepository: contains ${this.persons.size}`, { persons: this.persons });
    return !foundPerson;
  }
}
