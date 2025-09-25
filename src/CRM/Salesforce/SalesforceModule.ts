import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';

import { SalesforceSettings } from './Model/Settings/SalesforceSettings';
import { SalesforceIntegrationService } from './Service/SalesforceIntegrationService';
import { SalesforceSettingsService } from './Service/Settings/SalesforceSettingsService';
import { CreateSettingsController } from './Controller/Settings/CreateSettingsController';
import { GetSettingsController } from './Controller/Settings/GetSettingsController';
import { DeleteSettingsController } from './Controller/Settings/DeleteSettingsController';
import { AuthCallbackController } from './Controller/Auth/AuthCallbackController';
import { AuthConnectController } from './Controller/Auth/AuthConnectController';
import { AuthDisconnectController } from './Controller/Auth/AuthDisconnectController';

@Module({
  imports: [TypeOrmModule.forFeature([SalesforceSettings]), IAMModule],
  providers: [SalesforceIntegrationService, SalesforceSettingsService],
  controllers: [
    CreateSettingsController,
    GetSettingsController,
    DeleteSettingsController,
    AuthConnectController,
    AuthCallbackController,
    AuthDisconnectController,
  ],
  exports: [SalesforceIntegrationService],
})
export class SalesforceModule {}
