import { Auth0UserResponseIdentityType } from './auth0-user-response-identity.type';

export interface Auth0UserResponse {
  created_at: string;
  email: string;
  email_verified: boolean;
  family_name: string;
  given_name: string;
  identities: Auth0UserResponseIdentityType[];
  locale: string;
  name: string;
  nickname: string;
  picture: string;
  updated_at: string;
  user_id: string;
  last_ip: string;
  last_login: string;
  logins_count: number;
}
