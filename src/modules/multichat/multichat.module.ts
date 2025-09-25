import { Module } from '@nestjs/common';

import { IAMModule } from '@/modules/iam/iam.module';

import { ChatModule } from './chat/chat.module';
import { ChatMessageModule } from './chat-message/chat-message.module';
import { ChatProviderModule } from './chat-provider/chat-provider.module';
import { ProvidersModule } from './providers/providers.module';
import { ChatUserModule } from './chat-user/chat-user.module';
import { ChatMessageScheduledModule } from './chat-message-scheduled/chat-message-scheduled.module';

import { MultichatController } from './multichat.controller';

@Module({
  imports: [
    IAMModule,
    ChatModule,
    ChatUserModule,
    ChatMessageModule,
    ChatProviderModule,
    ProvidersModule,
    ChatMessageScheduledModule,
  ],
  controllers: [MultichatController],
  exports: [ChatModule],
})
export class MultichatModule {}
