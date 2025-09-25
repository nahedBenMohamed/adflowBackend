import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class SiteFormConsentDto {
  @ApiProperty()
  @IsNumber()
  formId: number;

  @ApiProperty()
  @IsBoolean()
  isEnabled: boolean;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  text?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  linkUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  linkText?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  defaultValue?: boolean;
}
