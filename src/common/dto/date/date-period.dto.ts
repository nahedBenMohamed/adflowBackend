import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DatePeriodDto {
  @ApiPropertyOptional({ description: 'Start date', nullable: true })
  @IsOptional()
  @IsString()
  startDate?: string | null;

  @ApiPropertyOptional({ description: 'End date', nullable: true })
  @IsOptional()
  @IsString()
  endDate?: string | null;
}
