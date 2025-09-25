import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { RentalIntervalType } from '../entities/rental-interval-type.enum';

export class RentalIntervalDto {
  @ApiProperty({ enum: RentalIntervalType })
  @IsEnum(RentalIntervalType)
  type: RentalIntervalType;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  startTime: string | null;

  constructor(type: RentalIntervalType, startTime: string | null) {
    this.type = type;
    this.startTime = startTime;
  }
}
