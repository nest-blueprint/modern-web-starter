import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';
import { AppModule } from '../module';
import { ExceptionInterceptor } from '../module/core/src/infrastructure/interceptor/exception.interceptor';
import { ConfigLoaderService } from '../module/core/src/infrastructure/init/service/config-loader.service';
import { ConfigLoaderToken } from '../module/core/src/infrastructure/init/token.init';
import { HttpExceptionFilter } from '../module/core/src/infrastructure/filter/http-exception.filter';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get<ConfigLoaderService>(ConfigLoaderToken);

  const logger = app.get<Logger>(WINSTON_MODULE_PROVIDER);

  // This will let us use our own exceptions inside the application,
  // and convert them to Http exceptions before sending them via routes.
  app.useGlobalInterceptors(new ExceptionInterceptor(logger, config));

  // This will let us use handle some exceptions before the requests reach handlers,
  // like BadRequestException, NotFoundException...
  app.useGlobalFilters(new HttpExceptionFilter(logger, config));
  app.enableCors();

  await app.listen(config.get('application').PORT);
}
bootstrap();
