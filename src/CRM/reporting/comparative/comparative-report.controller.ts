import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { ComparativeReportDto, ComparativeReportFilterDto } from './dto';
import { ComparativeReportService } from './comparative-report.service';

@ApiTags('crm/reporting')
@Controller('crm/reporting/comparative')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class ComparativeReportController {
  constructor(private readonly service: ComparativeReportService) {}

  @ApiOperation({ summary: 'Get comparative report', description: 'Get comparative report' })
  @ApiBody({ type: ComparativeReportFilterDto, required: true, description: 'Comparative report filter' })
  @ApiOkResponse({ description: 'Comparative report', type: ComparativeReportDto })
  @Post()
  public async getComparativeReport(
    @CurrentAuth() { accountId, user }: AuthData,
    @Body() filter: ComparativeReportFilterDto,
  ) {
    return this.service.getReport({ accountId, user, filter });
  }
}
