import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class BooleanFilter {
  @ApiProperty({ description: 'Filter value' })
  @IsBoolean()
  value: boolean;
}
