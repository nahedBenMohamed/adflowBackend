import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

import { ComparativeReportCellDto } from './comparative-report-cell.dto';

export class ComparativeReportRowDto {
  @ApiProperty({ description: 'Owner ID' })
  @IsNumber()
  ownerId: number;

  @ApiProperty({ type: [ComparativeReportCellDto], description: 'Cells' })
  @IsArray()
  cells: ComparativeReportCellDto[];
}
