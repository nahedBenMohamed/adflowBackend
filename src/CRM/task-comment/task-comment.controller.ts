import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { PagingQuery, TransformToDto } from '@/common';
import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { CreateTaskCommentDto, TaskCommentDto, TaskCommentResultDto, UpdateTaskCommentDto } from './dto';
import { TaskCommentService } from './task-comment.service';

@ApiTags('crm/task-comments')
@Controller('crm/tasks/:taskId/comments')
@JwtAuthorized({ prefetch: { account: true } })
@TransformToDto()
export class TaskCommentController {
  constructor(private readonly service: TaskCommentService) {}

  @ApiOperation({ summary: 'Create task comment', description: 'Create task comment' })
  @ApiParam({ name: 'taskId', type: Number, required: true, description: 'Task ID' })
  @ApiBody({ type: CreateTaskCommentDto, required: true, description: 'Data for creating task comment' })
  @ApiCreatedResponse({ description: 'Task comment', type: TaskCommentDto })
  @Post()
  public async create(
    @CurrentAuth() { account, userId }: AuthData,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: CreateTaskCommentDto,
  ) {
    return this.service.create({ account, taskId, userId, dto });
  }

  @ApiOperation({ summary: 'Get task comments', description: 'Get task comments' })
  @ApiParam({ name: 'taskId', type: Number, required: true, description: 'Task ID' })
  @ApiOkResponse({ description: 'Task comments', type: TaskCommentResultDto })
  @Get()
  public async getComments(
    @CurrentAuth() { account }: AuthData,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Query() paging: PagingQuery,
  ): Promise<TaskCommentResultDto> {
    return this.service.getComments({ account, taskId, paging });
  }

  @ApiOperation({ summary: 'Update task comment', description: 'Update task comment' })
  @ApiParam({ name: 'taskId', type: Number, required: true, description: 'Task ID' })
  @ApiParam({ name: 'commentId', type: Number, required: true, description: 'Comment ID' })
  @ApiBody({ type: UpdateTaskCommentDto, required: true, description: 'Data for updating task comment' })
  @ApiOkResponse({ description: 'Task comment', type: TaskCommentDto })
  @Put(':commentId')
  public async update(
    @CurrentAuth() { account }: AuthData,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() dto: UpdateTaskCommentDto,
  ) {
    return this.service.update({ account, commentId, dto });
  }

  @ApiOperation({ summary: 'Delete task comment', description: 'Delete task comment' })
  @ApiParam({ name: 'taskId', type: Number, required: true, description: 'Task ID' })
  @ApiParam({ name: 'commentId', type: Number, required: true, description: 'Comment ID' })
  @ApiOkResponse()
  @Delete(':commentId')
  public async delete(@CurrentAuth() { accountId }: AuthData, @Param('commentId', ParseIntPipe) commentId: number) {
    return this.service.delete({ accountId, commentId });
  }
}
