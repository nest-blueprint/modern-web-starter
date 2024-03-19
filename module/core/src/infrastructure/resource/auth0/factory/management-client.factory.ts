import { ManagementClient } from 'auth0';
import { ManagementClientToken } from '../token';
import { ConfigLoaderService } from '../../../init/service/config-loader.service';
import { ConfigLoaderToken } from '../../../init/token.init';

export const ManagementClientFactory = {
  provide: ManagementClientToken,
  imports: [],
  providers: [],
  inject: [ConfigLoaderToken],
  useFactory: (configLoaderService: ConfigLoaderService) => {
    return new ManagementClient({
      domain: configLoaderService.get('auth0.domain'),
      clientId: configLoaderService.get('auth0.clientId'),
      clientSecret: configLoaderService.get('auth0.clientSecret'),
      scope: configLoaderService.get('auth0.scope'),
    });
  },
};
