import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { DatePeriodDto } from '@/common';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { TimeBoardService } from '../../Service/TimeBoard/TimeBoardService';
import { TaskOrActivityCard } from '../../Service/TimeBoard/TaskOrActivityCard';
import { TimeBoardFilter } from '../../Service/TimeBoard/TimeBoardFilter';

@ApiTags('crm/tasks/time-board/calendar')
@Controller()
@JwtAuthorized({ prefetch: { account: true, user: true } })
export class GetTimeBoardCalendarController {
  constructor(private readonly service: TimeBoardService) {}

  @ApiOkResponse({ description: 'Time board calendar' })
  @Post('/crm/tasks/by_time/calendar')
  public async getCalendar(
    @CurrentAuth() { account, user }: AuthData,
    @Query() period: DatePeriodDto,
    @Body() filter: TimeBoardFilter,
  ): Promise<TaskOrActivityCard[]> {
    return this.service.getCalendar(account, user, period, filter);
  }
}
