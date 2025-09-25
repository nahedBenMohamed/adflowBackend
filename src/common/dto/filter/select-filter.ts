import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class SelectFilter {
  @ApiProperty({ description: 'List of option IDs', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  optionIds: number[];
}
