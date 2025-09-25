import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

import { FieldGroupDto } from './field-group.dto';

export class CreateFieldGroupDto extends PickType(FieldGroupDto, ['name', 'sortOrder', 'code'] as const) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  id?: number;
}
