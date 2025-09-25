import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';

import { ReservationModule } from '../reservation/reservation.module';
import { WarehouseModule } from '../warehouse/warehouse.module';

import { ProductStock } from './entities/product-stock.entity';
import { ProductStockService } from './product-stock.service';
import { StockController } from './product-stock.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductStock]), IAMModule, ReservationModule, forwardRef(() => WarehouseModule)],
  controllers: [StockController],
  providers: [ProductStockService],
  exports: [ProductStockService],
})
export class ProductStockModule {}
