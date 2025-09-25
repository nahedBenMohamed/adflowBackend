import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { TaskSettingsDto, CreateTaskSettingsDto, UpdateTaskSettingsDto } from './dto';
import { TaskSettingsService } from './task-settings.service';

@ApiTags('crm/task-settings')
@Controller('/crm/task-settings')
@JwtAuthorized()
@TransformToDto()
export class TaskSettingsController {
  constructor(private readonly service: TaskSettingsService) {}

  @ApiCreatedResponse({ description: 'Create task settings', type: TaskSettingsDto })
  @Post()
  public async create(@CurrentAuth() { accountId }: AuthData, @Body() dto: CreateTaskSettingsDto) {
    return await this.service.create(accountId, dto);
  }

  @ApiCreatedResponse({ description: 'Task settings list', type: [TaskSettingsDto] })
  @Get()
  public async findMany(@CurrentAuth() { accountId }: AuthData) {
    return await this.service.findMany(accountId);
  }

  @ApiCreatedResponse({ description: 'Update task settings', type: TaskSettingsDto })
  @Put(':id')
  public async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskSettingsDto,
  ) {
    return await this.service.update(accountId, id, dto);
  }
}
