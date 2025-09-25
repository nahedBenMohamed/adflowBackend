import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { AuthData, CurrentAuth, JwtAuthorized, UserAccess } from '../common';

import { DepartmentDto, CreateDepartmentDto, UpdateDepartmentDto, DeleteDepartmentDto } from './dto';
import { DepartmentService } from './department.service';

@ApiTags('IAM/departments')
@Controller('departments')
@JwtAuthorized()
@TransformToDto()
export class DepartmentController {
  constructor(private readonly service: DepartmentService) {}

  @ApiOperation({ summary: 'Create department', description: 'Create department' })
  @ApiBody({ description: 'Data for creating department', type: CreateDepartmentDto })
  @ApiCreatedResponse({ description: 'Department', type: DepartmentDto })
  @Post()
  @UserAccess({ adminOnly: true })
  async create(@CurrentAuth() { accountId }: AuthData, @Body() dto: CreateDepartmentDto) {
    return await this.service.create({ accountId, dto });
  }

  @ApiOperation({ summary: 'Get department hierarchy', description: 'Get departments in hierarchical view' })
  @ApiOkResponse({ description: 'List of top level departments', type: [DepartmentDto] })
  @Get()
  public async getHierarchy(@CurrentAuth() { accountId }: AuthData) {
    return await this.service.getHierarchy({ accountId, expand: ['settings'] });
  }

  @ApiOperation({ summary: 'Update department', description: 'Update department information' })
  @ApiParam({ name: 'departmentId', description: 'Department ID' })
  @ApiBody({ description: 'Data for updating department', type: UpdateDepartmentDto })
  @ApiOkResponse({ description: 'Department', type: DepartmentDto })
  @Patch(':departmentId')
  @UserAccess({ adminOnly: true })
  async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Body() dto: UpdateDepartmentDto,
  ): Promise<DepartmentDto> {
    return await this.service.update({ accountId, departmentId, dto });
  }

  @ApiOperation({ summary: 'Delete department', description: 'Mark department as not active' })
  @ApiParam({ name: 'departmentId', description: 'Department ID' })
  @ApiQuery({ name: 'newDepartmentId', description: 'New department ID to reassign employees to', required: false })
  @ApiOkResponse()
  @Delete(':departmentId')
  @UserAccess({ adminOnly: true })
  public async delete(
    @CurrentAuth() { accountId }: AuthData,
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Query() dto: DeleteDepartmentDto,
  ) {
    return await this.service.softDelete({ accountId, departmentId, newDepartmentId: dto?.newDepartmentId });
  }
}
