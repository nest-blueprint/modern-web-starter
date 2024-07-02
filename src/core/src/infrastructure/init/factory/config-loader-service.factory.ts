import { ConfigLoaderToken } from '../token.init';
import { ConfigLoaderService } from '../service/config-loader.service';
import { appConfig } from '../../../../../../config/autoload/app.config';

export const ConfigLoaderServiceFactory = {
  provide: ConfigLoaderToken,
  imports: [],
  providers: [],
  inject: [],
  useFactory: () => {
    const config = appConfig();
    return new ConfigLoaderService(config);
  },
};
