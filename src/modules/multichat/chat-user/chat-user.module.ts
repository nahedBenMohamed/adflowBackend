import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatUser, ChatUserExternal } from './entities';
import { ChatUserService } from './chat-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChatUser, ChatUserExternal])],
  providers: [ChatUserService],
  exports: [ChatUserService],
})
export class ChatUserModule {}
