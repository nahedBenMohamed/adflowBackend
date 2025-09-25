import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { ExistsFilterType } from '../../enums';

export class ExistsFilter {
  @ApiProperty({ description: 'Filter type', enum: ExistsFilterType })
  @IsEnum(ExistsFilterType)
  type: ExistsFilterType;
}
