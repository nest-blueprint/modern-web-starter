import { Auth0UserId } from '../../../src/infrastructure/resource/auth0/type/auth0-user-id';

export type User = {
  auth0UserId: Auth0UserId | undefined;
  userAccessToken: string | undefined;
};
