import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PagingQuery, TransformToDto } from '@/common';
import { AuthData, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { CallHistoryReportDto, CallHistoryReportFilterDto, CallReportDto, CallReportFilterDto } from './dto';
import { VoximplantReportingService } from './voximplant-reporting.service';

@ApiTags('telephony/voximplant/reporting')
@Controller('reporting')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class VoximplantReportingController {
  constructor(private readonly service: VoximplantReportingService) {}

  @ApiOperation({ summary: 'Get call report', description: 'Get call report' })
  @ApiBody({ type: CallReportFilterDto, required: true, description: 'Call report filter' })
  @ApiOkResponse({ description: 'General call report', type: CallReportDto })
  @Post('call')
  public async getCallReport(@CurrentAuth() { accountId, user }: AuthData, @Body() filter: CallReportFilterDto) {
    return this.service.getCallReport({ accountId, user, filter });
  }

  @ApiOperation({ summary: 'Get call history report', description: 'Get call history report' })
  @ApiBody({ type: CallHistoryReportFilterDto, required: true, description: 'Call history report filter' })
  @ApiOkResponse({ description: 'Call history report', type: CallHistoryReportDto })
  @Post('call/history')
  public async getCallHistoryReport(
    @CurrentAuth() { accountId, user }: AuthData,
    @Body() filter: CallHistoryReportFilterDto,
    @Query() paging: PagingQuery,
  ) {
    return this.service.getCallHistoryReport({ accountId, user, filter, paging });
  }
}
