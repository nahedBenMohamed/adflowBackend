import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class VoximplantNumberFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  accessibleUserId?: number;
}
