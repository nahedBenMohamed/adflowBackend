import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { MAIL_PROVIDER_KEY } from './decorators';
import { MailProvider } from './types';

@Injectable()
export class MailProviderRegistry implements OnModuleInit {
  private readonly logger = new Logger(MailProviderRegistry.name);
  private readonly providers = new Map<string, MailProvider>();

  constructor(private readonly discoveryService: DiscoveryService) {}

  onModuleInit() {
    const providers = this.discoveryService
      .getProviders()
      .filter((provider) => provider.metatype && Reflect.getMetadata(MAIL_PROVIDER_KEY, provider.metatype))
      .map((provider) => ({
        instance: provider.instance as MailProvider,
        type: Reflect.getMetadata(MAIL_PROVIDER_KEY, provider.metatype) as string,
      }));

    for (const provider of providers) {
      this.providers.set(provider.type, provider.instance);
      this.logger.log(`Registered mail provider: ${provider.type}`);
    }
  }

  get(type: string): MailProvider {
    const impl = this.providers.get(type);
    if (!impl) {
      throw new Error(`Mail provider not found for: ${type}`);
    }
    return impl;
  }
}
