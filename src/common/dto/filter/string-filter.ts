import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { StringFilterType } from '../../enums';

export class StringFilter {
  @ApiProperty({ description: 'Filter type', enum: StringFilterType })
  @IsEnum(StringFilterType)
  type: StringFilterType;

  @ApiPropertyOptional({ description: 'Filter value' })
  @IsOptional()
  @IsString()
  text?: string | null;
}
