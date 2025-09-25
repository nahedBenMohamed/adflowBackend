import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';

import { ProductPrice } from './entities/product-price.entity';
import { ProductPriceService } from './product-price.service';
import { ProductPriceController } from './product-price.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductPrice]), IAMModule],
  controllers: [ProductPriceController],
  providers: [ProductPriceService],
  exports: [ProductPriceService],
})
export class ProductPriceModule {}
