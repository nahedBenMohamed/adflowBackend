import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { ChatModule } from '../chat/chat.module';
import { ChatProviderUserModule } from '../chat-provider-user/chat-provider-user.module';
import { ChatUserModule } from '../chat-user/chat-user.module';

import { ChatProvider, ChatProviderEntitySettings } from './entities';
import { ChatProviderEntitySettingsService, ChatProviderHandler, ChatProviderService } from './services';
import { ChatProviderController } from './chat-provider.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatProvider, ChatProviderEntitySettings]),
    IAMModule,
    ChatProviderUserModule,
    forwardRef(() => ChatModule),
    ChatUserModule,
  ],
  providers: [ChatProviderService, ChatProviderHandler, ChatProviderEntitySettingsService],
  controllers: [ChatProviderController],
  exports: [ChatProviderService],
})
export class ChatProviderModule {}
