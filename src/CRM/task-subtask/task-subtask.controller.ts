import { Body, Controller, Delete, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { CreateTaskSubtaskDto, TaskSubtaskDto, UpdateTaskSubtaskDto } from './dto';
import { TaskSubtaskService } from './task-subtask.service';

@ApiTags('crm/tasks/subtasks')
@Controller('/crm/tasks/:taskId/subtasks')
@JwtAuthorized()
@TransformToDto()
export class TaskSubtaskController {
  constructor(private readonly service: TaskSubtaskService) {}

  @ApiCreatedResponse({ description: 'Create subtask', type: TaskSubtaskDto })
  @Post()
  public async create(
    @CurrentAuth() { accountId }: AuthData,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: CreateTaskSubtaskDto,
  ) {
    return this.service.create(accountId, taskId, dto);
  }

  @ApiOkResponse({ description: 'Update subtask', type: TaskSubtaskDto })
  @Put(':subtaskId')
  public async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('subtaskId', ParseIntPipe) subtaskId: number,
    @Body() dto: UpdateTaskSubtaskDto,
  ) {
    return this.service.update(accountId, taskId, subtaskId, dto);
  }

  @ApiOkResponse({ description: 'Delete subtask' })
  @Delete(':subtaskId')
  public async delete(
    @CurrentAuth() { accountId }: AuthData,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('subtaskId', ParseIntPipe) subtaskId: number,
  ) {
    await this.service.delete(accountId, taskId, subtaskId);
  }
}
