import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ProjectReportFieldDto {
  @ApiProperty({ description: 'Field ID' })
  @IsNumber()
  fieldId: number;

  @ApiProperty({ description: 'Field name' })
  @IsString()
  fieldName: string;

  @ApiProperty({ description: 'Field value' })
  @IsNumber()
  value: number;
}
