import { Module } from '@nestjs/common';

import { IAMModule } from '@/modules/iam/iam.module';
import { EntityFieldModule } from '@/modules/entity/entity-field/entity-field.module';
import { CrmModule } from '@/CRM/crm.module';

import { PartnerService } from './partner.service';
import { PartnerController } from './partner.controller';

@Module({
  imports: [IAMModule, EntityFieldModule, CrmModule],
  providers: [PartnerService],
  controllers: [PartnerController],
  exports: [PartnerService],
})
export class PartnerModule {}
