import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { ComparativeReportValueDto } from './comparative-report-value.dto';

export class ComparativeReportCellDto {
  @ApiProperty({ description: 'Date depending on report type' })
  @IsString()
  date: string;

  @ApiProperty({ type: ComparativeReportValueDto, description: 'All' })
  all: ComparativeReportValueDto;

  @ApiProperty({ type: ComparativeReportValueDto, description: 'Open' })
  open: ComparativeReportValueDto;

  @ApiProperty({ type: ComparativeReportValueDto, description: 'Lost' })
  lost: ComparativeReportValueDto;

  @ApiProperty({ type: ComparativeReportValueDto, description: 'Won' })
  won: ComparativeReportValueDto;
}
