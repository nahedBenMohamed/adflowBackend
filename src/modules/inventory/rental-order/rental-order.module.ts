import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { EntityInfoModule } from '@/modules/entity/entity-info/entity-info.module';

import { RentalScheduleModule } from '../rental-schedule/rental-schedule.module';
import { WarehouseModule } from '../warehouse/warehouse.module';

import { RentalOrder } from './entities/rental-order.entity';
import { RentalOrderItem } from './entities/rental-order-item.entity';
import { RentalOrderPeriod } from './entities/rental-order-period.entity';
import { RentalOrderController } from './rental-order.controller';
import { RentalOrderService } from './services/rental-order.service';
import { RentalOrderItemService } from './services/rental-order-item.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RentalOrder, RentalOrderItem, RentalOrderPeriod]),
    IAMModule,
    EntityInfoModule,
    forwardRef(() => WarehouseModule),
    forwardRef(() => RentalScheduleModule),
  ],
  controllers: [RentalOrderController],
  providers: [RentalOrderItemService, RentalOrderService],
  exports: [RentalOrderService],
})
export class RentalOrderModule {}
