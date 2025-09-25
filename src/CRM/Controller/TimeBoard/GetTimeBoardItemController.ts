import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { TaskView } from '../../base-task';
import { ActivityCardDto } from '../../activity-card';
import { TaskBoardCardDto } from '../../task-board';

import { TimeBoardService } from '../../Service/TimeBoard/TimeBoardService';
import { TimeBoardFilter } from '../../Service/TimeBoard/TimeBoardFilter';

@ApiTags('crm/tasks/time-board')
@Controller()
@JwtAuthorized({ prefetch: { account: true, user: true } })
export class GetTimeBoardItemController {
  constructor(private readonly service: TimeBoardService) {}

  @ApiCreatedResponse({ description: 'Task or activity' })
  @Post('/crm/tasks/by_time/:type/:id')
  public async getTimeBoardItem(
    @CurrentAuth() { account, user }: AuthData,
    @Param('type') type: TaskView,
    @Param('id', ParseIntPipe) id: number,
    @Body() filter: TimeBoardFilter,
  ): Promise<TaskBoardCardDto | ActivityCardDto | null> {
    return this.service.getTimeBoardItem(account, user, type, id, filter);
  }
}
