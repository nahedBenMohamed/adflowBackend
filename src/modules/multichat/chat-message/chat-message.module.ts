import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { StorageModule } from '@/modules/storage/storage.module';

import { ChatModule } from '../chat/chat.module';
import { ChatProviderModule } from '../chat-provider/chat-provider.module';
import { ProvidersModule } from '../providers/providers.module';
import { ChatUserModule } from '../chat-user';

import { ChatMessageFile } from './entities/chat-message-file.entity';
import { ChatMessageReaction } from './entities/chat-message-reaction.entity';
import { ChatMessageUserStatus } from './entities/chat-message-user-status.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatMessageFileService } from './services/chat-message-file.service';
import { ChatMessageReactionService } from './services/chat-message-reaction.service';
import { ChatMessageUserStatusService } from './services/chat-message-user-status.service';
import { ChatMessageService } from './services/chat-message.service';
import { ChatNotificationService } from './services/chat-notification.service';
import { ChatMessageController } from './chat-message.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, ChatMessageFile, ChatMessageUserStatus, ChatMessageReaction]),
    IAMModule,
    StorageModule,
    forwardRef(() => ChatModule),
    ChatProviderModule,
    ProvidersModule,
    ChatUserModule,
  ],
  providers: [
    ChatMessageService,
    ChatMessageUserStatusService,
    ChatMessageFileService,
    ChatMessageReactionService,
    ChatNotificationService,
  ],
  controllers: [ChatMessageController],
  exports: [ChatMessageService],
})
export class ChatMessageModule {}
