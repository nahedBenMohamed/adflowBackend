import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SiteFormResultDto {
  @ApiProperty({ description: 'Result' })
  @IsBoolean()
  result: boolean;

  @ApiPropertyOptional({ nullable: true, description: 'Message' })
  @IsOptional()
  @IsString()
  message?: string | null;
}
