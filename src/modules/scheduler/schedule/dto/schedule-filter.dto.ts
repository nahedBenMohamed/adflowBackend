import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class ScheduleFilterDto {
  @ApiPropertyOptional({ description: 'EntityType ID' })
  @IsOptional()
  @IsNumber()
  entityTypeId?: number;
}
