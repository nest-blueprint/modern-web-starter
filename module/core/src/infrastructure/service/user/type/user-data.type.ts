import { User } from '../../../../domain/user';
import { Mentor } from '../../../../domain/mentor';
import { Customer } from '../../../../domain/customer';
import { Auth0UserId } from '../../../resource/auth0/type/auth0-user-id';

export type UserData = {
  hasUserAccount: boolean;
  auth0UserId: Auth0UserId;
  user: User | null;
  profile: {
    profileData: Customer | Mentor | null;
    isCustomer: boolean;
    isMentor: boolean;
    hasProfile: boolean;
  };
};
