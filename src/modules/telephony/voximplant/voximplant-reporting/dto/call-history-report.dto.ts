import { ApiProperty } from '@nestjs/swagger';

import { PagingMeta } from '@/common';
import { VoximplantCallDto } from '../../voximplant-call';

export class CallHistoryReportDto {
  @ApiProperty({ type: [VoximplantCallDto], description: 'Calls' })
  calls: VoximplantCallDto[];

  @ApiProperty({ type: PagingMeta, description: 'Paging meta' })
  meta: PagingMeta;
}
