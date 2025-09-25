import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { CreateTaskDto, TaskDto, UpdateTaskDto } from './dto';
import { TaskService } from './task.service';

@ApiTags('crm/tasks')
@Controller('/crm/tasks')
@JwtAuthorized({ prefetch: { account: true, user: true } })
export class TaskController {
  constructor(private readonly service: TaskService) {}

  @ApiCreatedResponse({ description: 'Create task', type: TaskDto })
  @Post()
  public async create(@CurrentAuth() { account, user }: AuthData, @Body() dto: CreateTaskDto): Promise<TaskDto> {
    return await this.service.createAndGetDto(account, user, dto);
  }

  @ApiCreatedResponse({ description: 'Get task', type: TaskDto })
  @Get(':taskId')
  public async findOne(
    @CurrentAuth() { account, user }: AuthData,
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<TaskDto> {
    return await this.service.findDtoById(account, user, taskId);
  }

  @ApiCreatedResponse({ description: 'Update task', type: TaskDto })
  @Patch(':taskId')
  public async update(
    @CurrentAuth() { account, user }: AuthData,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskDto> {
    return await this.service.updateAndGetDto(account, user, taskId, dto);
  }

  @ApiOkResponse({ description: 'Delete task' })
  @Delete(':taskId')
  public async delete(@CurrentAuth() { accountId, user }: AuthData, @Param('taskId', ParseIntPipe) taskId: number) {
    await this.service.delete({ user, filter: { accountId, taskId } });
  }
}
