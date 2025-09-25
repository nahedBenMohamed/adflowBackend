import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';

import { TaskSettings } from './entities';
import { TaskSettingsService } from './task-settings.service';
import { TaskSettingsHandler } from './task-settings.handler';
import { TaskSettingsController } from './task-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TaskSettings]), IAMModule],
  controllers: [TaskSettingsController],
  providers: [TaskSettingsHandler, TaskSettingsService],
  exports: [TaskSettingsService],
})
export class TaskSettingsModule {}
