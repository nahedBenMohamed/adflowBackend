import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';

import { Reservation } from './entities/reservation.entity';
import { ReservationService } from './reservation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation]), IAMModule],
  providers: [ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
