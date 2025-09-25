import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { CrmModule } from '@/CRM/crm.module';

import { TestAccount } from './entities/test-account.entity';
import { PublicTestDataController } from './public-test-data.controller';
import { TestDataService } from './test-data.service';

@Module({
  imports: [TypeOrmModule.forFeature([TestAccount]), IAMModule, CrmModule],
  controllers: [PublicTestDataController],
  providers: [TestDataService],
})
export class TestDataModule {}
