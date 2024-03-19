import { QueryInterface } from './query.interface';

export interface QueryHandlerInterface {
  execute(query: QueryInterface): Promise<unknown>;
}
