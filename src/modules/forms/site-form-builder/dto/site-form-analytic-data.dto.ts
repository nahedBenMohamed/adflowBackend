import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SiteFormAnalyticDataDto {
  @ApiProperty({ description: 'Code' })
  @IsString()
  code: string;

  @ApiProperty({ nullable: true, description: 'Value' })
  value: unknown | null;
}
