import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { StorageModule } from '@/modules/storage/storage.module';

import { ChatMessageModule } from '../../chat-message/chat-message.module';
import { ChatProviderModule } from '../../chat-provider/chat-provider.module';

import facebookConfig from './config/facebook.config';
import { ChatProviderMessenger } from './entities';
import { MessengerProviderService } from './messenger-provider.service';
import { MessengerProviderController, PublicMessengerProviderController } from './controllers';

@Module({
  imports: [
    ConfigModule.forFeature(facebookConfig),
    TypeOrmModule.forFeature([ChatProviderMessenger]),
    IAMModule,
    StorageModule,
    forwardRef(() => ChatMessageModule),
    ChatProviderModule,
  ],
  providers: [MessengerProviderService],
  controllers: [MessengerProviderController, PublicMessengerProviderController],
  exports: [MessengerProviderService],
})
export class FacebookProviderModule {}
