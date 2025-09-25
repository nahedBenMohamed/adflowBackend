import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class PublicSiteFormFieldScheduleSpotDto {
  @ApiProperty({ description: 'Start time in ISO format' })
  @IsDateString()
  from: string;

  @ApiProperty({ description: 'End time in ISO format' })
  @IsDateString()
  to: string;
}
