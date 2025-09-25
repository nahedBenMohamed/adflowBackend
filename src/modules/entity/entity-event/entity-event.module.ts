import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { OrderModule } from '@/modules/inventory/order/order.module';
import { RentalOrderModule } from '@/modules/inventory/rental-order/rental-order.module';
import { ShipmentModule } from '@/modules/inventory/shipment/shipment.module';
import { TelephonyModule } from '@/modules/telephony/telephony.module';
import { CrmModule } from '@/CRM/crm.module';
import { MailingModule } from '@/Mailing/MailingModule';

import { EntityEvent } from './entities/entity-event.entity';
import { EntityEventController } from './entity-event.controller';
import { EntityEventHandler } from './entity-event.handler';
import { EntityEventService } from './entity-event.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EntityEvent]),
    IAMModule,
    CrmModule,
    OrderModule,
    RentalOrderModule,
    ShipmentModule,
    MailingModule,
    TelephonyModule,
  ],
  controllers: [EntityEventController],
  providers: [EntityEventHandler, EntityEventService],
})
export class EntityEventModule {}
