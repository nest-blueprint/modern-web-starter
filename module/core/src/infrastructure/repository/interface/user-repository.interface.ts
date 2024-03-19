import { Auth0UserId } from '../../resource/auth0/type/auth0-user-id';
import { Result } from 'neverthrow';
import { User } from '../../../domain/user';

export interface UserRepositoryInterface {
  add(user: User, auth0UserId: Auth0UserId): Promise<Result<User, Error>> | Result<User, Error>;
  getUserByAuth0Id(auth0UserId: Auth0UserId): Promise<Result<User, Error>> | Result<User, Error>;
  count: () => Promise<Result<number, Error>> | Result<number, Error>;
}
