import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UnsubscribeDto {
  @ApiProperty({ description: 'Entity ID' })
  @IsNumber()
  entityId: number;
}
