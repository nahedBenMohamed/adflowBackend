import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { Entity } from '@/CRM/Model/Entity/Entity';

import { EntityInfoController } from './entity-info.controller';
import { EntityInfoService } from './entity-info.service';

@Module({
  imports: [TypeOrmModule.forFeature([Entity]), IAMModule],
  controllers: [EntityInfoController],
  providers: [EntityInfoService],
  exports: [EntityInfoService],
})
export class EntityInfoModule {}
