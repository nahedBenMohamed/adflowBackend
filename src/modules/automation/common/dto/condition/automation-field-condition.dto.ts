import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

import { SimpleFilter } from '@/common';

export class AutomationFieldCondition extends SimpleFilter {
  @ApiProperty({ description: 'Field ID' })
  @IsNumber()
  fieldId: number;
}
