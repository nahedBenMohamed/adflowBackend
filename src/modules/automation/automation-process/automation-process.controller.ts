import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { AuthData } from '@/modules/iam/common/types/auth-data';

import {
  AutomationProcessDto,
  AutomationProcessFilterDto,
  CreateAutomationProcessDto,
  UpdateAutomationProcessDto,
} from './dto';
import { AutomationProcessService } from './automation-process.service';

@ApiTags('automation/processes')
@Controller('processes')
@JwtAuthorized({ access: { adminOnly: true } })
@TransformToDto()
export class AutomationProcessController {
  constructor(private readonly service: AutomationProcessService) {}

  @ApiOperation({ summary: 'Create automation process', description: 'Create automation process' })
  @ApiBody({ description: 'Data for creating automation process', type: CreateAutomationProcessDto })
  @ApiCreatedResponse({ description: 'Automation process', type: AutomationProcessDto })
  @Post()
  async create(@CurrentAuth() { accountId, userId }: AuthData, @Body() dto: CreateAutomationProcessDto) {
    return this.service.create({ accountId, userId, dto });
  }

  @ApiOperation({ summary: 'Get automation processes', description: 'Get automation processes' })
  @ApiOkResponse({ description: 'Automation processes', type: [AutomationProcessDto] })
  @Get()
  async findMany(@CurrentAuth() { accountId }: AuthData, @Query() filter: AutomationProcessFilterDto) {
    return this.service.findMany({
      accountId,
      ...filter,
      isReadonly: filter.isReadonly ? filter.isReadonly === 'true' : undefined,
    });
  }

  @ApiOperation({ summary: 'Get automation process', description: 'Get automation process' })
  @ApiParam({ name: 'processId', description: 'Automation process ID' })
  @ApiOkResponse({ description: 'Automation process', type: AutomationProcessDto })
  @Get(':processId')
  async findOne(@CurrentAuth() { accountId }: AuthData, @Param('processId', ParseIntPipe) processId: number) {
    return this.service.findOne({ accountId, processId });
  }

  @ApiOperation({ summary: 'Update automation process', description: 'Update automation process' })
  @ApiParam({ name: 'processId', description: 'Automation process ID' })
  @ApiBody({ description: 'Data for updating automation process', type: UpdateAutomationProcessDto })
  @ApiOkResponse({ description: 'Automation process', type: AutomationProcessDto })
  @Patch(':processId')
  async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('processId', ParseIntPipe) processId: number,
    @Body() dto: UpdateAutomationProcessDto,
  ) {
    return this.service.update({ accountId, processId, dto });
  }

  @ApiOperation({ summary: 'Delete automation process', description: 'Delete automation process' })
  @ApiParam({ name: 'processId', description: 'Automation process ID' })
  @ApiOkResponse({ description: 'Deleted automation process ID', type: Number })
  @Delete(':processId')
  async delete(@CurrentAuth() { accountId }: AuthData, @Param('processId', ParseIntPipe) processId: number) {
    return this.service.delete({ accountId, processId });
  }

  @ApiExcludeEndpoint(true)
  @Post('clean-unused')
  async cleanUnused() {
    return this.service.cleanUnused();
  }

  @ApiExcludeEndpoint(true)
  @Post('clean-unlinked')
  async cleanUnlinked() {
    return this.service.cleanUnlinked();
  }
}
