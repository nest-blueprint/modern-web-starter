import { InMemoryAuth0Service } from '../../../test/double/provider/external/auth0/authentication/service/in-memory-auth0-users.service';

export type Services = {
  auth0: InMemoryAuth0Service | undefined;
};
