import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import {
  ProjectEntitiesReportDto,
  ProjectEntitiesReportFilterDto,
  ProjectTaskUserReportDto,
  ProjectTaskUserReportFilterDto,
} from './dto';
import { ProjectReportService } from './project-report.service';

@ApiTags('crm/reporting')
@Controller('crm/reporting/project')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class ProjectReportController {
  constructor(private readonly service: ProjectReportService) {}

  @ApiOperation({ summary: 'Get project entities report', description: 'Get project entities report' })
  @ApiBody({ type: ProjectEntitiesReportFilterDto, required: true, description: 'Project report filter' })
  @ApiOkResponse({ description: 'Get project entities report', type: ProjectEntitiesReportDto })
  @Post('entities')
  public async getProjectEntitiesReport(
    @CurrentAuth() { accountId, user }: AuthData,
    @Body() filter: ProjectEntitiesReportFilterDto,
  ) {
    return this.service.getEntitiesReport({ accountId, user, filter });
  }

  @ApiOperation({
    summary: 'Get project report by task responsible users',
    description: 'Get project report by task responsible users',
  })
  @ApiBody({ type: ProjectTaskUserReportFilterDto, required: true, description: 'Project report filter' })
  @ApiOkResponse({ description: 'Project report by task responsible users', type: ProjectTaskUserReportDto })
  @Post('users')
  public async getProjectTaskUserReport(
    @CurrentAuth() { accountId, user }: AuthData,
    @Body() filter: ProjectTaskUserReportFilterDto,
  ) {
    return this.service.getTaskUserReport({ accountId, user, filter });
  }
}
