import { UserData } from './type/user-data.type';
import { Result } from 'neverthrow';
import { Auth0UserId } from '../../resource/auth0/type/auth0-user-id';
import { Id as UserId } from '../../../domain/user/id';
import { Id as MentorId } from '../../../domain/mentor/id';
import { Id as CustomerId } from '../../../domain/customer/id';

export interface UserServiceInterface {
  getUserAccountData: (auth0UserId: Auth0UserId) => Promise<UserData>;
  ensureAuth0IdIsMatchingUserAccount: (auth0UserId: Auth0UserId, id: UserId | MentorId | CustomerId) => Promise<null>;
}
