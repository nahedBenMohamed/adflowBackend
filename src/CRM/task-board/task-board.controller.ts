import { Body, Controller, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { DatePeriodDto, PagingQuery } from '@/common';
import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { TaskBoardCardDto, TaskBoardFilterDto, TaskBoardMeta, TaskCalendarMeta, TaskListMeta } from './dto';
import { TaskBoardService } from './task-board.service';

@ApiTags('crm/tasks/board')
@Controller('/crm/tasks')
@JwtAuthorized({ prefetch: { account: true, user: true } })
export class TaskBoardController {
  constructor(private readonly service: TaskBoardService) {}

  @ApiOperation({ summary: 'Get list of tasks', description: 'Get list of tasks' })
  @ApiParam({ name: 'boardId', description: 'Board ID', type: Number, required: true })
  @ApiBody({ description: 'Filter data for list of tasks', type: TaskBoardFilterDto })
  @ApiOkResponse({ description: 'Task cards', type: [TaskBoardCardDto] })
  @Post('list/:boardId')
  public async getTaskList(
    @CurrentAuth() { account, user }: AuthData,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() filter: TaskBoardFilterDto,
    @Query() paging: PagingQuery,
  ) {
    return this.service.getTaskList(account, user, boardId, filter, paging);
  }

  @ApiOperation({ summary: 'Get meta for list of tasks', description: 'Get meta for list of tasks' })
  @ApiParam({ name: 'boardId', description: 'Board ID', type: Number, required: true })
  @ApiBody({ description: 'Filter data for list of tasks', type: TaskBoardFilterDto })
  @ApiOkResponse({ description: 'Meta for list of tasks', type: TaskListMeta })
  @Post('list/:boardId/meta')
  public async getTaskListMeta(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() filter: TaskBoardFilterDto,
  ) {
    return this.service.getTaskListMeta(accountId, user, boardId, filter);
  }

  @ApiOperation({ summary: 'Get tasks for board', description: 'Get tasks for board' })
  @ApiParam({ name: 'boardId', description: 'Board ID', type: Number, required: true })
  @ApiBody({ description: 'Filter data for board', type: TaskBoardFilterDto })
  @ApiOkResponse({ description: 'Task cards', type: [TaskBoardCardDto] })
  @Post('boards/:boardId')
  public async getTaskBoardCards(
    @CurrentAuth() { account, user }: AuthData,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() filter: TaskBoardFilterDto,
    @Query() paging: PagingQuery,
  ) {
    return this.service.getTaskBoardCards(account, user, boardId, filter, paging);
  }

  @ApiOperation({ summary: 'Get meta for board', description: 'Get meta for board' })
  @ApiParam({ name: 'boardId', description: 'Board ID', type: Number, required: true })
  @ApiBody({ description: 'Filter data for board', type: TaskBoardFilterDto })
  @ApiOkResponse({ description: 'Meta for board', type: TaskBoardMeta })
  @Post('boards/:boardId/meta')
  public async getTaskBoardMeta(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() filter: TaskBoardFilterDto,
  ) {
    return this.service.getTaskBoardMeta(accountId, user, boardId, filter);
  }

  @ApiOperation({ summary: 'Get calendar for tasks', description: 'Get calendar for tasks' })
  @ApiParam({ name: 'boardId', description: 'Board ID', type: Number, required: true })
  @ApiBody({ description: 'Filter data for calendar', type: TaskBoardFilterDto })
  @ApiOkResponse({ description: 'Task cards', type: [TaskBoardCardDto] })
  @Post('calendar/:boardId')
  public async getTaskCalendar(
    @CurrentAuth() { account, user }: AuthData,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query() period: DatePeriodDto,
    @Body() filter: TaskBoardFilterDto,
  ) {
    return this.service.getTaskCalendar(account, user, boardId, period, filter);
  }

  @ApiOperation({ summary: 'Get meta for calendar', description: 'Get meta for calendar' })
  @ApiParam({ name: 'boardId', description: 'Board ID', type: Number, required: true })
  @ApiBody({ description: 'Filter data for calendar', type: TaskBoardFilterDto })
  @ApiOkResponse({ description: 'Meta for calendar', type: TaskCalendarMeta })
  @Post('calendar/:boardId/meta')
  public async getTaskCalendarMeta(
    @CurrentAuth() { account, user }: AuthData,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query() period: DatePeriodDto,
    @Body() filter: TaskBoardFilterDto,
  ) {
    return this.service.getTaskCalendarMeta(account, user, boardId, period, filter);
  }

  @ApiOperation({ summary: 'Get task card', description: 'Get task card' })
  @ApiParam({ name: 'taskId', description: 'Task ID', type: Number, required: true })
  @ApiBody({ description: 'Filter data for task card', type: TaskBoardFilterDto })
  @ApiOkResponse({ description: 'Task card', type: TaskBoardCardDto })
  @Post('cards/:taskId')
  public async getTaskBoardCard(
    @CurrentAuth() { account, user }: AuthData,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() filter: TaskBoardFilterDto,
    @Query('boardId') boardId?: number,
  ) {
    return this.service.getTaskBoardCard(account, user, taskId, filter, boardId);
  }
}
