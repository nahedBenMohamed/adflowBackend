import { Module } from '@nestjs/common';

import { OrderStatusModule } from './order-status/order-status.module';
import { OrderModule } from './order/order.module';
import { ProductCategoryModule } from './product-category/product-category.module';
import { ProductPriceModule } from './product-price/product-price.module';
import { ProductStockModule } from './product-stock/product-stock.module';
import { ProductModule } from './product/product.module';
import { ProductsSectionModule } from './products-section/products-section.module';
import { RentalIntervalModule } from './rental-interval/rental-interval.module';
import { RentalOrderModule } from './rental-order/rental-order.module';
import { RentalScheduleModule } from './rental-schedule/rental-schedule.module';
import { ReservationModule } from './reservation/reservation.module';
import { ShipmentModule } from './shipment/shipment.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { InventoryReportingModule } from './inventory-reporting/inventory-reporting.module';

@Module({
  imports: [
    OrderStatusModule,
    OrderModule,
    ProductCategoryModule,
    ProductModule,
    ProductPriceModule,
    ProductStockModule,
    ProductsSectionModule,
    RentalIntervalModule,
    RentalOrderModule,
    RentalScheduleModule,
    ReservationModule,
    ShipmentModule,
    WarehouseModule,
    InventoryReportingModule,
  ],
  exports: [
    OrderStatusModule,
    OrderModule,
    ProductCategoryModule,
    ProductModule,
    ProductsSectionModule,
    RentalIntervalModule,
    RentalOrderModule,
    WarehouseModule,
    ShipmentModule,
  ],
})
export class InventoryModule {}
