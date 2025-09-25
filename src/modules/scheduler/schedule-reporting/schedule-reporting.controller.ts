import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { ScheduleReportDto, ScheduleReportFilterDto } from './dto';
import { ScheduleReportingService } from './schedule-reporting.service';

@ApiTags('scheduler/reporting')
@Controller('reporting')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class ScheduleReportingController {
  constructor(private readonly service: ScheduleReportingService) {}

  @ApiOperation({ summary: 'Get schedule report', description: 'Get schedule report' })
  @ApiBody({ type: ScheduleReportFilterDto, description: 'Schedule report filter' })
  @ApiOkResponse({ description: 'Schedule report', type: ScheduleReportDto })
  @Post('schedule')
  public async getReport(@CurrentAuth() { accountId, user }: AuthData, @Body() filter: ScheduleReportFilterDto) {
    return this.service.getReport({ accountId, user, filter });
  }
}
