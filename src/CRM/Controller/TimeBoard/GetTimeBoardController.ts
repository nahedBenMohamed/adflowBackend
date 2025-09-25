import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { PagingQuery } from '@/common';
import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { TimeBoardService } from '../../Service/TimeBoard/TimeBoardService';
import { TaskOrActivityCard } from '../../Service/TimeBoard/TaskOrActivityCard';
import { TimeBoardFilter } from '../../Service/TimeBoard/TimeBoardFilter';

@ApiTags('crm/tasks/time-board')
@Controller()
@JwtAuthorized({ prefetch: { account: true, user: true } })
export class GetTimeBoardController {
  constructor(private readonly service: TimeBoardService) {}

  @ApiCreatedResponse({ description: 'All tasks and activities' })
  @Post('/crm/tasks/by_time')
  public async getTimeBoard(
    @CurrentAuth() { account, user }: AuthData,
    @Body() filter: TimeBoardFilter,
    @Query() paging: PagingQuery,
  ): Promise<TaskOrActivityCard[]> {
    return this.service.getTimeBoardCards(account, user, filter, paging);
  }
}
