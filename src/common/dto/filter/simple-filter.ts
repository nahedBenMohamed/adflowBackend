import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { IsEnum, IsObject } from 'class-validator';

import { SimpleFilterType } from '../../enums';
import { BooleanFilter, DateFilter, ExistsFilter, NumberFilter, SelectFilter, StringFilter } from '../../dto';

export class SimpleFilter {
  @ApiProperty({ description: 'Filter type', enum: SimpleFilterType })
  @IsEnum(SimpleFilterType)
  type: SimpleFilterType;

  @ApiProperty({
    description: 'Filter value',
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(BooleanFilter) },
        { $ref: getSchemaPath(DateFilter) },
        { $ref: getSchemaPath(ExistsFilter) },
        { $ref: getSchemaPath(NumberFilter) },
        { $ref: getSchemaPath(SelectFilter) },
        { $ref: getSchemaPath(StringFilter) },
      ],
    },
  })
  @IsObject()
  filter: BooleanFilter | DateFilter | ExistsFilter | NumberFilter | SelectFilter | StringFilter;
}
