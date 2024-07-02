import { Injectable } from '@nestjs/common';
import { Config } from '../../type/config.type';
import { getProperty } from '../../util/function.util';

@Injectable()
export class ConfigLoaderService {
  constructor(private readonly _config: Config) {
    Object.freeze(this);
  }

  get(key: string): any {
    return getProperty(this._config, key);
  }
}
