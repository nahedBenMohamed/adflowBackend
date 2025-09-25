import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { EntityInfoModule } from '@/modules/entity/entity-info/entity-info.module';

import { ProductModule } from '../product/product.module';
import { RentalOrderModule } from '../rental-order/rental-order.module';
import { RentalEvent } from './entities/rental-event.entity';
import { RentalScheduleController } from './rental-schedule.controller';
import { RentalScheduleService } from './rental-schedule.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RentalEvent]),
    IAMModule,
    EntityInfoModule,
    forwardRef(() => ProductModule),
    forwardRef(() => RentalOrderModule),
  ],
  controllers: [RentalScheduleController],
  providers: [RentalScheduleService],
  exports: [RentalScheduleService],
})
export class RentalScheduleModule {}
