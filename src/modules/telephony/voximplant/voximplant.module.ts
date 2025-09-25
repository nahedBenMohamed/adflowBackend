import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { EntityInfoModule } from '@/modules/entity/entity-info/entity-info.module';
import { CrmModule } from '@/CRM/crm.module';

import voximplantConfig from './config/voximplant.config';
import { VoximplantAccount, VoximplantAccountController, VoximplantAccountService } from './voximplant-account';
import {
  VoximplantCall,
  VoximplantCallController,
  VoximplantCallPublicController,
  VoximplantCallService,
} from './voximplant-call';
import { VoximplantCoreController, VoximplantCoreService } from './voximplant-core';
import {
  VoximplantNumber,
  VoximplantNumberController,
  VoximplantNumberService,
  VoximplantNumberUser,
  VoximplantNumberUserService,
} from './voximplant-number';
import { VoximplantReportingService, VoximplantReportingController } from './voximplant-reporting';
import {
  VoximplantScenarioEntity,
  VoximplantScenarioNote,
  VoximplantScenarioTask,
  VoximplantScenarioService,
  VoximplantScenarioController,
} from './voximplant-scenario';
import {
  VoximplantSip,
  VoximplantSipController,
  VoximplantSipService,
  VoximplantSipUser,
  VoximplantSipUserService,
} from './voximplant-sip';
import {
  VoximplantUser,
  VoximplantUserService,
  VoximplantUserController,
  VoximplantUserPublicController,
} from './voximplant-user';

@Module({
  imports: [
    ConfigModule.forFeature(voximplantConfig),
    TypeOrmModule.forFeature([
      VoximplantAccount,
      VoximplantUser,
      VoximplantNumber,
      VoximplantNumberUser,
      VoximplantCall,
      VoximplantScenarioEntity,
      VoximplantScenarioNote,
      VoximplantScenarioTask,
      VoximplantSip,
      VoximplantSipUser,
    ]),
    IAMModule,
    EntityInfoModule,
    forwardRef(() => CrmModule),
  ],
  providers: [
    VoximplantCoreService,
    VoximplantAccountService,
    VoximplantUserService,
    VoximplantNumberService,
    VoximplantNumberUserService,
    VoximplantCallService,
    VoximplantScenarioService,
    VoximplantReportingService,
    VoximplantSipService,
    VoximplantSipUserService,
  ],
  controllers: [
    VoximplantCoreController,
    VoximplantAccountController,
    VoximplantUserController,
    VoximplantUserPublicController,
    VoximplantNumberController,
    VoximplantCallController,
    VoximplantCallPublicController,
    VoximplantScenarioController,
    VoximplantSipController,
    VoximplantReportingController,
  ],
  exports: [VoximplantCallService, VoximplantReportingService],
})
export class VoximplantModule {}
