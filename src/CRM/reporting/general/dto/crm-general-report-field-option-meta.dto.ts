import { FieldFormat } from '@/modules/entity/entity-field/field';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class CrmGeneralReportFieldOptionMetaDto {
  @ApiProperty()
  @IsNumber()
  optionId: number;

  @ApiProperty()
  optionLabel: string | boolean;

  @ApiPropertyOptional({
    enum: FieldFormat,
    nullable: true,
    description: 'Field format of display for specific field types',
  })
  @IsOptional()
  @IsEnum(FieldFormat)
  format?: FieldFormat | null;
}
