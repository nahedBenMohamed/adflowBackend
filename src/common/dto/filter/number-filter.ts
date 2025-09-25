import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class NumberFilter {
  @ApiPropertyOptional({ description: 'Minimum value' })
  @IsOptional()
  @IsNumber()
  min?: number;

  @ApiPropertyOptional({ description: 'Maximum value' })
  @IsOptional()
  @IsNumber()
  max?: number;
}
