import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ProjectReportFieldMetaDto {
  @ApiProperty({ description: 'Field ID' })
  @IsNumber()
  fieldId: number;

  @ApiProperty({ description: 'Field name' })
  @IsString()
  fieldName: string;
}
