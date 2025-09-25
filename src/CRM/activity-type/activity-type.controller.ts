import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { ActivityTypeDto, CreateActivityTypeDto, UpdateActivityTypeDto } from './dto';
import { ActivityTypeService } from './activity-type.service';

@ApiTags('crm/activity-type')
@Controller('crm/activity-types')
@JwtAuthorized()
@TransformToDto()
export class ActivityTypeController {
  constructor(private readonly service: ActivityTypeService) {}

  @ApiOperation({ summary: 'Create activity type', description: 'Create activity type' })
  @ApiBody({ type: CreateActivityTypeDto, required: true, description: 'Data to create activity type' })
  @ApiCreatedResponse({ description: 'Activity type', type: ActivityTypeDto })
  @Post()
  async create(@CurrentAuth() { accountId }: AuthData, @Body() dto: CreateActivityTypeDto) {
    return this.service.create({ accountId, dto });
  }

  @ApiOperation({ summary: 'Get all activity types', description: 'Get all activity types for account' })
  @ApiOkResponse({ description: 'Activity types', type: [ActivityTypeDto] })
  @Get()
  async findMany(@CurrentAuth() { accountId }: AuthData) {
    return this.service.findMany({ accountId });
  }

  @ApiOperation({ summary: 'Update activity type', description: 'Update activity type' })
  @ApiParam({ name: 'activityTypeId', type: Number, required: true, description: 'Activity type ID' })
  @ApiBody({ type: UpdateActivityTypeDto, required: true, description: 'Data to update activity type' })
  @ApiOkResponse({ description: 'Activity type', type: ActivityTypeDto })
  @Patch(':activityTypeId')
  async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('activityTypeId', ParseIntPipe) activityTypeId: number,
    @Body() dto: UpdateActivityTypeDto,
  ) {
    return this.service.update({ accountId, activityTypeId, dto });
  }

  @ApiOperation({ summary: 'Delete activity type', description: 'Delete activity type' })
  @ApiParam({ name: 'activityTypeId', type: Number, required: true, description: 'Activity type ID' })
  @ApiOkResponse()
  @Delete(':activityTypeId')
  async delete(@CurrentAuth() { accountId }: AuthData, @Param('activityTypeId', ParseIntPipe) activityTypeId: number) {
    await this.service.setActive({ accountId, activityTypeId, isActive: false });
  }
}
