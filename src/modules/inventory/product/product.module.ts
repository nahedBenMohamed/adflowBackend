import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { StorageModule } from '@/modules/storage/storage.module';
import { CrmModule } from '@/CRM/crm.module';

import { ProductPriceModule } from '../product-price/product-price.module';
import { ProductStockModule } from '../product-stock/product-stock.module';
import { ProductCategoryModule } from '../product-category/product-category.module';
import { RentalScheduleModule } from '../rental-schedule/rental-schedule.module';

import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    IAMModule,
    forwardRef(() => CrmModule),
    StorageModule,
    ProductPriceModule,
    ProductStockModule,
    ProductCategoryModule,
    forwardRef(() => RentalScheduleModule),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
