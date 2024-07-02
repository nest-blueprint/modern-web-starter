import { User } from '../../../../src/domain/user';
import { Auth0UserId } from '../../../../src/infrastructure/resource/auth0/type/auth0-user-id';

export interface UserRecord {
  user: User;
  auth0Id: Auth0UserId;
}
