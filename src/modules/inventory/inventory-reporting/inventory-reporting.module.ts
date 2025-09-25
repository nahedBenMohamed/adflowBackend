import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { CrmModule } from '@/CRM/crm.module';

import { Product } from '../product/entities/product.entity';
import { ProductModule } from '../product/product.module';
import { ProductCategoryModule } from '../product-category/product-category.module';

import { InventoryReportingService } from './inventory-reporting.service';
import { InventoryReportingController } from './inventory-reporting.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    IAMModule,
    forwardRef(() => CrmModule),
    ProductModule,
    ProductCategoryModule,
  ],
  providers: [InventoryReportingService],
  controllers: [InventoryReportingController],
})
export class InventoryReportingModule {}
