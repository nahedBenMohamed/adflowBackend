import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

import { CallReportBlockDto } from './call-report-block.dto';

export class CallReportRowDto {
  @ApiProperty({ description: 'User ID or Department ID depends from report type or 0 for total row.' })
  @IsNumber()
  ownerId: number;

  @ApiProperty({ type: CallReportBlockDto, description: 'Call report block' })
  @IsArray()
  call: CallReportBlockDto;
}
