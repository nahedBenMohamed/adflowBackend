import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';

import { OrderStatusModule } from '../order-status/order-status.module';
import { ProductModule } from '../product/product.module';
import { ReservationModule } from '../reservation/reservation.module';
import { ShipmentModule } from '../shipment/shipment.module';
import { WarehouseModule } from '../warehouse/warehouse.module';

import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderItemService } from './services/order-item.service';
import { OrderService } from './services/order.service';
import { OrderHandler } from './services/order.handler';
import { OrderController } from './order.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    IAMModule,
    OrderStatusModule,
    forwardRef(() => ReservationModule),
    forwardRef(() => ProductModule),
    ShipmentModule,
    forwardRef(() => WarehouseModule),
  ],
  controllers: [OrderController],
  providers: [OrderItemService, OrderService, OrderHandler],
  exports: [OrderService],
})
export class OrderModule {}
