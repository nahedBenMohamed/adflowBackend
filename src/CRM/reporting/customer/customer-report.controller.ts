import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PagingQuery, TransformToDto } from '@/common';
import { AuthData, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { CustomerReportDto, CustomerReportFilterDto } from './dto';
import { CustomerReportService } from './customer-report.service';

@ApiTags('crm/reporting')
@Controller('crm/reporting/customer')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class CustomerReportController {
  constructor(private readonly service: CustomerReportService) {}

  @ApiOperation({ summary: 'Get customer report', description: 'Get customer report' })
  @ApiBody({ type: CustomerReportFilterDto, required: true, description: 'Customer report filter' })
  @ApiOkResponse({ description: 'Customer report', type: CustomerReportDto })
  @Post()
  async getCustomerReport(
    @CurrentAuth() { accountId, user }: AuthData,
    @Body() filter: CustomerReportFilterDto,
    @Query() paging: PagingQuery,
  ) {
    return this.service.getReport({ accountId, user, filter, paging });
  }
}
