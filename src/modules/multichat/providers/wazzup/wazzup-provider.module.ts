import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { StorageModule } from '@/modules/storage/storage.module';

import { ChatModule } from '../../chat/chat.module';
import { ChatMessageModule } from '../../chat-message/chat-message.module';
import { ChatProviderModule } from '../../chat-provider/chat-provider.module';

import wazzupConfig from './config/wazzup.config';
import { ChatProviderWazzup } from './entities';
import { WazzupProviderService } from './wazzup-provider.service';
import { PublicWazzupProviderController, WazzupProviderController } from './controllers';

@Module({
  imports: [
    ConfigModule.forFeature(wazzupConfig),
    TypeOrmModule.forFeature([ChatProviderWazzup]),
    IAMModule,
    StorageModule,
    forwardRef(() => ChatModule),
    forwardRef(() => ChatMessageModule),
    ChatProviderModule,
  ],
  providers: [WazzupProviderService],
  controllers: [WazzupProviderController, PublicWazzupProviderController],
  exports: [WazzupProviderService],
})
export class WazzupProviderModule {}
