import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { AuthData } from '@/modules/iam/common/types/auth-data';

import {
  AutomationEntityTypeDto,
  AutomationEntityTypeFilterDto,
  CreateAutomationEntityTypeDto,
  UpdateAutomationEntityTypeDto,
} from './dto';
import { AutomationEntityTypeService } from './automation-entity-type.service';

@ApiTags('automation/entity-types')
@Controller('entity-types')
@JwtAuthorized({ access: { adminOnly: true } })
@TransformToDto()
export class AutomationEntityTypeController {
  constructor(private readonly service: AutomationEntityTypeService) {}

  @ApiOperation({ summary: 'Create EntityType automation', description: 'Create simple automation for EntityType' })
  @ApiBody({ description: 'Data for creating EntityType automation', type: CreateAutomationEntityTypeDto })
  @ApiCreatedResponse({ description: 'EntityType automation', type: AutomationEntityTypeDto })
  @Post()
  async create(@CurrentAuth() { accountId, userId }: AuthData, @Body() dto: CreateAutomationEntityTypeDto) {
    return this.service.create({ accountId, userId, dto });
  }

  @ApiOperation({ summary: 'Get EntityType automations', description: 'Get simple automations for EntityType' })
  @ApiOkResponse({ description: 'EntityType automations', type: [AutomationEntityTypeDto] })
  @Get()
  async findMany(@CurrentAuth() { accountId }: AuthData, @Query() filter: AutomationEntityTypeFilterDto) {
    return this.service.findMany({ accountId, ...filter });
  }

  @ApiOperation({ summary: 'Get EntityType automation', description: 'Get simple automation for EntityType' })
  @ApiParam({ name: 'automationId', description: 'EntityType automation ID' })
  @ApiOkResponse({ description: 'EntityType automation', type: AutomationEntityTypeDto })
  @Get(':automationId')
  async findOne(@CurrentAuth() { accountId }: AuthData, @Param('automationId', ParseIntPipe) automationId: number) {
    return this.service.findOne({ accountId, automationId });
  }

  @ApiOperation({ summary: 'Update EntityType automation', description: 'Update simple automation for EntityType' })
  @ApiParam({ name: 'automationId', description: 'EntityType automation ID' })
  @ApiBody({ description: 'Data for updating EntityType automation', type: UpdateAutomationEntityTypeDto })
  @ApiOkResponse({ description: 'EntityType automation', type: AutomationEntityTypeDto })
  @Patch(':automationId')
  async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('automationId', ParseIntPipe) automationId: number,
    @Body() dto: UpdateAutomationEntityTypeDto,
  ) {
    return this.service.update({ accountId, automationId, dto });
  }

  @ApiOperation({ summary: 'Delete EntityType automation', description: 'Delete simple automation for EntityType' })
  @ApiParam({ name: 'automationId', description: 'EntityType automation ID' })
  @ApiOkResponse({ description: 'Deleted EntityType automation ID', type: Number })
  @Delete(':automationId')
  async delete(@CurrentAuth() { accountId }: AuthData, @Param('automationId', ParseIntPipe) automationId: number) {
    return this.service.delete({ accountId, automationId });
  }

  @ApiOperation({ summary: 'Generate BPMN', description: 'Generate BPM model for EntityType automation' })
  @ApiParam({ name: 'automationId', description: 'EntityType automation ID' })
  @ApiOkResponse({ description: 'BPMN model', type: String })
  @Get(':automationId/generate')
  async generate(@CurrentAuth() { accountId }: AuthData, @Param('automationId', ParseIntPipe) automationId: number) {
    return this.service.generateBpmn({ accountId, automationId });
  }
}
