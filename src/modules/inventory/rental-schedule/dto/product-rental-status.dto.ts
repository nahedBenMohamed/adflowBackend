import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber } from 'class-validator';

import { RentalScheduleStatus } from '../enums';
import { RentalEventDto } from './rental-event.dto';

export class ProductRentalStatusDto {
  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty({ nullable: true, enum: RentalScheduleStatus })
  @IsEnum(RentalScheduleStatus)
  rentalStatus: RentalScheduleStatus;

  @ApiProperty({ type: [RentalEventDto] })
  @IsArray()
  rentalEvents: RentalEventDto[];

  constructor(productId: number, rentalStatus: RentalScheduleStatus, rentalEvents: RentalEventDto[]) {
    this.productId = productId;
    this.rentalStatus = rentalStatus;
    this.rentalEvents = rentalEvents;
  }
}
