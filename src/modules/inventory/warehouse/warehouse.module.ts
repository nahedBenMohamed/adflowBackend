import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';

import { OrderModule } from '../order/order.module';
import { ProductStockModule } from '../product-stock/product-stock.module';
import { ReservationModule } from '../reservation/reservation.module';
import { ShipmentModule } from '../shipment/shipment.module';
import { RentalOrderModule } from '../rental-order/rental-order.module';

import { Warehouse } from './entities/warehouse.entity';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Warehouse]),
    IAMModule,
    forwardRef(() => OrderModule),
    forwardRef(() => ProductStockModule),
    ReservationModule,
    ShipmentModule,
    forwardRef(() => RentalOrderModule),
  ],
  controllers: [WarehouseController],
  providers: [WarehouseService],
  exports: [WarehouseService],
})
export class WarehouseModule {}
