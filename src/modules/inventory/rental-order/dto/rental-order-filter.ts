import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

import { RentalOrderStatus } from '../enums';

export class RentalOrderFilter {
  @ApiPropertyOptional({ type: Number, nullable: true })
  @IsOptional()
  @IsNumber()
  entityId?: number | null;

  @ApiPropertyOptional({ enum: RentalOrderStatus, isArray: true, nullable: true })
  @IsOptional()
  @IsArray()
  statuses?: RentalOrderStatus[] | null;
}
