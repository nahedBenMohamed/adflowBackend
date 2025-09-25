import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

import { SequenceName } from '../../common';

export class IdentityPoolDto {
  @ApiProperty({ enum: SequenceName, description: 'Identity pool name' })
  @IsString()
  name: SequenceName;

  @ApiProperty({ description: 'Identity pool values', type: [Number] })
  @IsNumber({}, { each: true })
  values: number[];
}
