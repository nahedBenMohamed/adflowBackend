import { forwardRef, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { EntityInfoModule } from '@/modules/entity/entity-info/entity-info.module';
import { DocumentsModule } from '@/modules/documents/documents.module';

import automationConfig from './config/automation.config';
import { AutomationCoreController, AutomationCoreService } from './automation-core';
import {
  AutomationProcess,
  AutomationProcessController,
  AutomationProcessHandler,
  AutomationProcessService,
} from './automation-process';
import {
  AutomationEntityType,
  AutomationEntityTypeController,
  AutomationEntityTypeHandler,
  AutomationEntityTypeService,
} from './automation-entity-type';
import { AutomationUtilController } from './automation-utils';
import { AutomationHttpController, AutomationHttpHandler, AutomationHttpService } from './automation-http';

@Module({
  imports: [
    ConfigModule.forFeature(automationConfig),
    DiscoveryModule,
    TypeOrmModule.forFeature([AutomationProcess, AutomationEntityType]),
    IAMModule,
    EntityInfoModule,
    forwardRef(() => DocumentsModule),
  ],
  providers: [
    AutomationCoreService,
    AutomationProcessService,
    AutomationProcessHandler,
    AutomationEntityTypeService,
    AutomationEntityTypeHandler,
    AutomationHttpService,
    AutomationHttpHandler,
  ],
  controllers: [
    AutomationCoreController,
    AutomationProcessController,
    AutomationEntityTypeController,
    AutomationUtilController,
    AutomationHttpController,
  ],
  exports: [AutomationCoreService],
})
export class AutomationModule {}
