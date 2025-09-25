import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { JwtAuthorized, CurrentAuth, AuthData, UserAccess } from '../common';
import { CreateDepartmentSettingsDto, DepartmentSettingsDto, UpdateDepartmentSettingsDto } from './dto';
import { DepartmentSettingsService } from './department-settings.service';

@ApiTags('IAM/departments')
@Controller('departments/:departmentId/settings')
@JwtAuthorized()
@TransformToDto()
export class DepartmentSettingsController {
  constructor(private readonly service: DepartmentSettingsService) {}

  @ApiOperation({ summary: 'Create department settings', description: 'Create settings for department' })
  @ApiParam({ name: 'departmentId', description: 'Department ID' })
  @ApiBody({ description: 'Data for creating department settings', type: CreateDepartmentSettingsDto })
  @ApiCreatedResponse({ description: 'Department settings', type: DepartmentSettingsDto })
  @Post()
  @UserAccess({ adminOnly: true })
  async create(
    @CurrentAuth() { accountId }: AuthData,
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Body() dto: CreateDepartmentSettingsDto,
  ) {
    return this.service.create({ accountId, departmentId, dto });
  }

  @ApiOperation({ summary: 'Get department settings', description: 'Get settings for department' })
  @ApiParam({ name: 'departmentId', description: 'Department ID' })
  @ApiOkResponse({ description: 'Department settings', type: DepartmentSettingsDto })
  @Get()
  public async findOne(
    @CurrentAuth() { accountId }: AuthData,
    @Param('departmentId', ParseIntPipe) departmentId: number,
  ) {
    return this.service.findOne({ accountId, departmentId }, { applyParent: true });
  }

  @ApiOperation({ summary: 'Update department settings', description: 'Update settings for department' })
  @ApiParam({ name: 'departmentId', description: 'Department ID' })
  @ApiBody({ description: 'Data for updating department settings', type: UpdateDepartmentSettingsDto })
  @ApiOkResponse({ description: 'Department settings', type: DepartmentSettingsDto })
  @Patch()
  @UserAccess({ adminOnly: true })
  public async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Body() dto: UpdateDepartmentSettingsDto,
  ) {
    return this.service.update({ accountId, departmentId, dto });
  }

  @ApiOperation({ summary: 'Delete department settings', description: 'Delete settings for department' })
  @ApiParam({ name: 'departmentId', description: 'Department ID' })
  @ApiOkResponse()
  @Delete()
  @UserAccess({ adminOnly: true })
  public async delete(
    @CurrentAuth() { accountId }: AuthData,
    @Param('departmentId', ParseIntPipe) departmentId: number,
  ) {
    return this.service.delete({ accountId, departmentId });
  }
}
