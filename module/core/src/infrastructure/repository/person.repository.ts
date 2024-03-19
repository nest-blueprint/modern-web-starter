import { Inject, Injectable } from '@nestjs/common';
import { err, ok, Result } from 'neverthrow';
import { PersonCollection } from '../../domain/collection/person.collection';
import { Person } from '../../domain/person';
import { Id as PersonId } from '../../domain/person/id';
import { RuntimeErrorException } from '../exception/runtime-error.exception';
import { PersonNotFoundException } from '../exception/person-not-found.exception';
import { PersonAlreadyExistsException } from '../exception/person-already-exists.exception';
import { Person as PersonEntity } from '../sequelize/entity/person.entity';
import { PersonMap } from '../map/person.map';
import { Sequelize } from 'sequelize-typescript';
import { SequelizeToken } from '../sequelize/token/sequelize.token';

import { Transaction } from 'sequelize';
import { storage } from '../storage/storage';

@Injectable()
export class PersonRepository implements PersonCollection {
  private readonly persons;
  constructor(@Inject(SequelizeToken) private sequelize: Sequelize) {
    this.persons = this.sequelize.getRepository(PersonEntity);
  }

  async add(person: Person): Promise<Result<Person, Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const personFound = await this.persons.findByPk(person.id.value, { transaction });
      if (personFound)
        return err(
          new PersonAlreadyExistsException(`Addition failed.A person with the id ${person.id.value} already exists`),
        );

      const personEntity = PersonMap.toEntity(person);
      const result = await personEntity.save({ transaction });
      const mappedPersonResult = PersonMap.toDomain(result);
      if (mappedPersonResult.isErr()) return err(mappedPersonResult.error);
      return ok(mappedPersonResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async delete(id: PersonId): Promise<Result<Person, Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const personFound = await this.persons.findByPk(id.value, { transaction });
      if (!personFound)
        return err(new PersonNotFoundException(`Deletion failed.A person with the id ${id.value} does not exist`));
      await personFound.destroy({ transaction });
      const mappedPersonResult = PersonMap.toDomain(personFound);
      if (mappedPersonResult.isErr()) return err(mappedPersonResult.error);
      return ok(mappedPersonResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async get(id: PersonId): Promise<Result<Person, Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const personFound = await this.persons.findByPk(id.value, { transaction });
      if (!personFound)
        return err(new PersonNotFoundException(`Get failed.A person with the id ${id.value} does not exist`));
      const mappedPersonResult = PersonMap.toDomain(personFound);
      if (mappedPersonResult.isErr()) return err(mappedPersonResult.error);
      return ok(mappedPersonResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async update(person: Person): Promise<Result<Person, Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const personFound = await this.persons.findByPk(person.id.value, { transaction });
      if (!personFound)
        return err(new PersonNotFoundException(`Update failed.A person with the id ${person.id.value} does not exist`));
      const personRaw = PersonMap.toRawObject(person);
      const result = await personFound.update(personRaw, { transaction });
      const mappedPersonResult = PersonMap.toDomain(result);
      if (mappedPersonResult.isErr()) return err(mappedPersonResult.error);
      return ok(mappedPersonResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }
}
