import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

import { RentalOrderItemDto } from './rental-order-item.dto';

export class UpdateRentalOrderItemDto extends OmitType(RentalOrderItemDto, ['id'] as const) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  id?: number;
}
