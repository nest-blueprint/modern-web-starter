import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { getClientIp } from 'request-ip';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}
  use(req: Request, res: Response, next: NextFunction) {
    const remoteAddress = getClientIp(req);

    this.logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${remoteAddress}`);
    next();
  }
}
