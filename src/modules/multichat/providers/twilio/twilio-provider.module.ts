import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { StorageModule } from '@/modules/storage/storage.module';

import { ChatMessageModule } from '../../chat-message/chat-message.module';
import { ChatProviderModule } from '../../chat-provider/chat-provider.module';

import { ChatProviderTwilio } from './entities';
import { TwilioProviderService } from './twilio-provider.service';
import { PublicTwilioProviderController, TwilioProviderController } from './controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatProviderTwilio]),
    IAMModule,
    StorageModule,
    forwardRef(() => ChatMessageModule),
    ChatProviderModule,
  ],
  providers: [TwilioProviderService],
  controllers: [TwilioProviderController, PublicTwilioProviderController],
  exports: [TwilioProviderService],
})
export class TwilioProviderModule {}
