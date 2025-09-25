import { Module } from '@nestjs/common';

import { ChatProviderModule } from '../chat-provider/chat-provider.module';
import { TwilioProviderModule } from './twilio/twilio-provider.module';
import { FacebookProviderModule } from './facebook/facebook-provider.module';
import { WazzupProviderModule } from './wazzup/wazzup-provider.module';
import { ChatProviderProxyService } from './chat-provider-proxy.service';

@Module({
  imports: [ChatProviderModule, FacebookProviderModule, TwilioProviderModule, WazzupProviderModule],
  providers: [ChatProviderProxyService],
  exports: [ChatProviderProxyService],
})
export class ProvidersModule {}
