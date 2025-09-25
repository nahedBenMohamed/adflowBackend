import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { SchedulerModule } from '@/modules/scheduler/scheduler.module';

import { OrderModule } from '../order/order.module';
import { RentalOrderModule } from '../rental-order/rental-order.module';

import { ProductsSectionEntityType } from './entities/products-section-entity-type.entity';
import { ProductsSection } from './entities/products-section.entity';
import { ProductsSectionLinkerService } from './services/products-section-linker.service';
import { ProductsSectionService } from './services/products-section.service';
import { ProductsSectionController } from './products-section.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductsSection, ProductsSectionEntityType]),
    IAMModule,
    forwardRef(() => SchedulerModule),
    OrderModule,
    RentalOrderModule,
  ],
  controllers: [ProductsSectionController],
  providers: [ProductsSectionService, ProductsSectionLinkerService],
  exports: [ProductsSectionService],
})
export class ProductsSectionModule {}
