import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class VoximplantSipFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  accessibleUserId?: number;
}
