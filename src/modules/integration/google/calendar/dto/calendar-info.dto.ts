import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CalendarInfoDto {
  @ApiProperty({ description: 'Calendar ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Calendar title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Is primary calendar' })
  @IsBoolean()
  primary: boolean;

  @ApiProperty({ description: 'Is read-only calendar' })
  @IsBoolean()
  readonly: boolean;

  @ApiPropertyOptional({ description: 'Calendar description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Calendar time zone' })
  @IsOptional()
  @IsString()
  timeZone?: string;

  @ApiPropertyOptional({ description: 'Calendar color in hex format', example: '#000000' })
  @IsOptional()
  @IsString()
  color?: string;
}
