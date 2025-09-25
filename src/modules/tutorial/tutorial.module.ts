import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '../iam/iam.module';

import tutorialConfig from './config/tutorial.config';
import {
  TutorialItem,
  TutorialItemUser,
  TutorialItemService,
  TutorialItemController,
  TutorialItemProduct,
  TutorialItemHandler,
} from './tutorial-item';
import { TutorialGroup, TutorialGroupService, TutorialGroupController } from './tutorial-group';
import { TutorialCoreController, TutorialCoreService } from './tutorial-core';

@Module({
  imports: [
    ConfigModule.forFeature(tutorialConfig),
    TypeOrmModule.forFeature([TutorialGroup, TutorialItem, TutorialItemUser, TutorialItemProduct]),
    IAMModule,
  ],
  providers: [TutorialGroupService, TutorialItemService, TutorialItemHandler, TutorialCoreService],
  controllers: [TutorialGroupController, TutorialItemController, TutorialCoreController],
})
export class TutorialModule {}
