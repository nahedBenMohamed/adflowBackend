import { INestApplication, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import documentationConfig from './config/documentation.config';

@Module({
  imports: [ConfigModule.forFeature(documentationConfig)],
})
export class ApiDocumentation {
  static configure(app: INestApplication) {
    const configService = app.get(ConfigService);

    if (configService.get<boolean>('documentation.enabled')) {
      const appName = configService.get<string>('application.name');
      const baseUrl = configService.get<string>('application.baseUrl');

      const config = new DocumentBuilder()
        .setTitle(`${appName} API`)
        .setDescription(
          `The ${appName} API enables secure and efficient access to various features of the ${appName} platform. 
This platform is designed to help businesses manage client relationships, automate tasks,
and enhance customer communication. With support for multiple client accounts through subdomains,
the API allows businesses to interact with client data, manage entities, and automate actions 
based on customizable conditions.`,
        )
        .setVersion(process.env.npm_package_version)
        .addBearerAuth()
        .addApiKey({ type: 'apiKey', in: 'header', name: 'X-Api-Key' })
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('doc', app, document, {
        useGlobalPrefix: true,
        customSiteTitle: `${appName} API. Version: ${process.env.npm_package_version} `,
        customfavIcon: `${baseUrl}/favicon.ico`,
        swaggerOptions: {
          defaultModelRendering: 'model',
          layout: 'BaseLayout',
          tagsSorter: 'alpha',
          deepLinking: true,
        },
      });
    }
  }
}
