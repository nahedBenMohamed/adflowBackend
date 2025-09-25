import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PublicSiteFormConsentDto {
  @ApiProperty({ description: 'Site form consent enabled' })
  @IsBoolean()
  isEnabled: boolean;

  @ApiPropertyOptional({ nullable: true, description: 'Site form consent text' })
  @IsOptional()
  @IsString()
  text?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Site form consent link URL' })
  @IsOptional()
  @IsString()
  linkUrl?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Site form consent link text' })
  @IsOptional()
  @IsString()
  linkText?: string | null;

  @ApiPropertyOptional({ description: 'Site form consent default value' })
  @IsOptional()
  @IsBoolean()
  defaultValue?: boolean;
}
