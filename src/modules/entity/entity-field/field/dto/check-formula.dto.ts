import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CheckFormulaDto {
  @ApiProperty()
  @IsNumber()
  entityTypeId: number;

  @ApiProperty()
  @IsNumber()
  fieldId: number;

  @ApiProperty()
  @IsString()
  formula: string;
}
