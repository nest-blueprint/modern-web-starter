export interface Auth0UserResponseIdentityType {
  provider: string;
  access_token: string;
  expires_in: number;
  user_id: string;
  connection: string;
  isSocial: boolean;
}
