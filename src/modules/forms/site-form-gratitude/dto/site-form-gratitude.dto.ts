import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class SiteFormGratitudeDto {
  @ApiProperty()
  @IsNumber()
  formId: number;

  @ApiProperty()
  @IsBoolean()
  isEnabled: boolean;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  header?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  text?: string | null;
}
