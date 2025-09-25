import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatProviderUser } from './entities';
import { ChatProviderUserService } from './chat-provider-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChatProviderUser])],
  providers: [ChatProviderUserService],
  exports: [ChatProviderUserService],
})
export class ChatProviderUserModule {}
