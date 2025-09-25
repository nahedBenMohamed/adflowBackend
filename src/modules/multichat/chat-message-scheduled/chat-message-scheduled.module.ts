import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { CrmModule } from '@/CRM/crm.module';

import { ChatModule } from '../chat/chat.module';
import { ChatMessageModule } from '../chat-message/chat-message.module';
import { ChatProviderModule } from '../chat-provider/chat-provider.module';
import { ChatUserModule } from '../chat-user/chat-user.module';
import { ProvidersModule } from '../providers/providers.module';
import { DocumentsModule } from '@/modules/documents/documents.module';

import { ChatMessageScheduled } from './entities';
import { ChatMessageScheduledService } from './chat-message-scheduled.service';
import { ChatMessageScheduledController } from './chat-message-scheduled.controller';
import { ChatMessageScheduledHandler } from './chat-message-scheduled.handler';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessageScheduled]),
    IAMModule,
    forwardRef(() => CrmModule),
    ChatModule,
    ChatMessageModule,
    ChatProviderModule,
    ChatUserModule,
    ProvidersModule,
    DocumentsModule,
  ],
  providers: [ChatMessageScheduledService, ChatMessageScheduledHandler],
  controllers: [ChatMessageScheduledController],
})
export class ChatMessageScheduledModule {}
