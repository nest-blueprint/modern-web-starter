import { Result } from 'neverthrow';
import { Person } from '../person';
import { Id as PersonId } from '../../domain/person/id';

export interface PersonCollection {
  add: (person: Person) => any;
  update: (person: Person) => any;
  delete: (id: PersonId) => any;
  get: (id: PersonId) => any;
}
