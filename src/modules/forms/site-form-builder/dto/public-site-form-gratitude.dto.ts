import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PublicSiteFormGratitudeDto {
  @ApiProperty({ description: 'Site form gratitude enabled' })
  @IsBoolean()
  isEnabled: boolean;

  @ApiPropertyOptional({ nullable: true, description: 'Site form gratitude header' })
  @IsOptional()
  @IsString()
  header?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Site form gratitude text' })
  @IsOptional()
  @IsString()
  text?: string | null;
}
