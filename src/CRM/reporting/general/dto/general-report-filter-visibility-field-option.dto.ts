import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class GeneralReportFilterVisibilityFieldOptionDto {
  @ApiProperty({ nullable: true, description: 'Option ID' })
  @IsNumber()
  optionId: number;

  @ApiPropertyOptional({ nullable: true, description: 'Exclude option' })
  @IsOptional()
  @IsBoolean()
  exclude?: boolean | null;
}
