import { User } from '../user';
import { Id } from '../user/id';
import { Email } from '../user/email';

export interface UserCollection {
  add: (user: User) => any;
  update: (user: User) => any;
  delete: (id: Id) => any;
  find(id: Id[]): any;
  findOneByEmail: (email: Email) => any;
  getByEmail: (email: Email) => any;
  get: (id: Id) => any;
}
