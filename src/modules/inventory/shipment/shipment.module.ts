import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { EntityInfoModule } from '@/modules/entity/entity-info/entity-info.module';

import { OrderStatusModule } from '../order-status/order-status.module';
import { ReservationModule } from '../reservation/reservation.module';
import { ProductStockModule } from '../product-stock/product-stock.module';
import { WarehouseModule } from '../warehouse/warehouse.module';

import { Shipment, ShipmentItem } from './entities';
import { ShipmentService } from './shipment.service';
import { ShipmentController } from './shipment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShipmentItem, Shipment]),
    IAMModule,
    EntityInfoModule,
    OrderStatusModule,
    forwardRef(() => ReservationModule),
    forwardRef(() => ProductStockModule),
    forwardRef(() => WarehouseModule),
  ],
  controllers: [ShipmentController],
  providers: [ShipmentService],
  exports: [ShipmentService],
})
export class ShipmentModule {}
