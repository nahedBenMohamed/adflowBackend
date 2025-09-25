import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { GeneralReportService } from './general-report.service';
import { GeneralReportFilterDto, GeneralReportDto } from './dto';

@ApiTags('crm/reporting')
@Controller('crm/reporting/general')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class GeneralReportController {
  constructor(private readonly service: GeneralReportService) {}

  @ApiOperation({ summary: 'Get general report', description: 'Get general report' })
  @ApiBody({ type: GeneralReportFilterDto, required: true, description: 'General report filter' })
  @ApiOkResponse({ description: 'General report', type: GeneralReportDto })
  @Post()
  public async getGeneralReport(@CurrentAuth() { accountId, user }: AuthData, @Body() filter: GeneralReportFilterDto) {
    return this.service.getGeneralReport({ accountId, user, filter });
  }
}
