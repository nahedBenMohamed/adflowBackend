import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { utilities, WinstonModule } from 'nest-winston';
import winston from 'winston';

import { AppModule } from './app.module';
import { ApiDocumentation } from './documentation';
import { extractSubdomain, LoggingInterceptor } from './common';

function getLogger() {
  return process.env.WINSTON_ENABLED === 'true'
    ? WinstonModule.createLogger({
        level: 'debug',
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
              utilities.format.nestLike(process.env.APPLICATION_NAME, { colors: true, prettyPrint: true }),
            ),
          }),
        ],
      })
    : undefined;
}

async function bootstrap() {
  if (process.env.NEW_RELIC_ENABLED === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('newrelic');
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true, logger: getLogger() });
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.set('trust proxy', true);
  app.use(extractSubdomain);
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new LoggingInterceptor());

  ApiDocumentation.configure(app);

  const logger = new Logger('main');

  process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception`, error.stack);
  });

  await app.listen(process.env.APPLICATION_PORT);

  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`Application version is: ${process.env.npm_package_version}`);
}

bootstrap();
