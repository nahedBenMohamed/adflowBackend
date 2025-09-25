import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { CrmModule } from '@/CRM/crm.module';
import { EntityInfoModule } from '@/modules/entity/entity-info/entity-info.module';
import { DocumentsModule } from '@/modules/documents/documents.module';

import { ChatUserModule } from '../chat-user';
import { ChatMessageModule } from '../chat-message/chat-message.module';
import { ChatProviderModule } from '../chat-provider/chat-provider.module';
import { ProvidersModule } from '../providers/providers.module';

import { Chat, ChatPinnedMessage } from './entities';
import { ChatService, ChatPinnedMessageService, ChatHandler } from './services';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatPinnedMessage]),
    IAMModule,
    forwardRef(() => CrmModule),
    EntityInfoModule,
    forwardRef(() => ChatMessageModule),
    ChatProviderModule,
    ProvidersModule,
    ChatUserModule,
    DocumentsModule,
  ],
  providers: [ChatService, ChatPinnedMessageService, ChatHandler],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
