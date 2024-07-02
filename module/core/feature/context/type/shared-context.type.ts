import { User } from './user.type';
import { Request } from './request.type';
import { Repositories } from './repositories.type';
import { Registered } from './registred.type';
import { Services } from './services.type';
import { Response } from './response.type';
import { InMemoryUserResource } from '../../../test/double/provider/external/auth0/authorization/resource/in-memory-user-resource';

export type SharedContext = {
  user: User;
  requestBody: Request;
  requestResponse: Response;
  repositories: Repositories;
  registered: Registered;
  services: Services;

  resources: {
    userResource: undefined | InMemoryUserResource;
  };
};
