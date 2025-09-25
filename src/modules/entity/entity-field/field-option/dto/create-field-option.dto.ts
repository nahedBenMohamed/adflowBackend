import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

import { FieldOptionDto } from './field-option.dto';

export class CreateFieldOptionDto extends PickType(FieldOptionDto, ['label', 'color', 'sortOrder'] as const) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  id?: number;
}
