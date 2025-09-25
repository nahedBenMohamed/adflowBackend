import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class ActionSendOptionsValue {
  @ApiProperty({ description: 'Use only first value' })
  @IsOptional()
  @IsBoolean()
  onlyFirstValue?: boolean | null;
}
