import { Module } from '@nestjs/common';

import { AccountSetupModule } from './account-setup/account-setup.module';
import { DemoDataModule } from './demo-data/demo-data.module';
import { RmsModule } from './rms/rms.module';
//import { TestDataModule } from './test-data/test-data.module';

@Module({
  imports: [RmsModule, DemoDataModule, AccountSetupModule /*, TestDataModule*/],
})
export class SetupModule {}
