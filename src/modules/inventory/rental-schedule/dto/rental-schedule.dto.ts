import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

import { ProductInfoDto } from '../../product/dto/product-info.dto';
import { RentalEventDto } from './rental-event.dto';

export class RentalScheduleDto {
  @ApiProperty({ type: [ProductInfoDto] })
  @IsArray()
  products: ProductInfoDto[];

  @ApiProperty({ type: [RentalEventDto] })
  @IsArray()
  events: RentalEventDto[];

  constructor(products: ProductInfoDto[], events: RentalEventDto[]) {
    this.products = products;
    this.events = events;
  }
}
