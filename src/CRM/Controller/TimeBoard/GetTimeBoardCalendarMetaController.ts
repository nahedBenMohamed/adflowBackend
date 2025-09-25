import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { DatePeriodDto } from '@/common';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { TimeBoardService } from '../../Service/TimeBoard/TimeBoardService';
import { TimeBoardCalendarMeta } from '../../Service/TimeBoard/TimeBoardCalendarMeta';
import { TimeBoardFilter } from '../../Service/TimeBoard/TimeBoardFilter';

@ApiTags('crm/tasks/time-board/calendar')
@Controller()
@JwtAuthorized({ prefetch: { account: true, user: true } })
export class GetTimeBoardCalendarMetaController {
  constructor(private readonly service: TimeBoardService) {}

  @ApiOkResponse({ description: 'Meta for calendar', type: TimeBoardCalendarMeta })
  @Post('/crm/tasks/by_time/calendar/meta')
  public async getCalendarMeta(
    @CurrentAuth() { account, user }: AuthData,
    @Query() period: DatePeriodDto,
    @Body() filter: TimeBoardFilter,
  ): Promise<TimeBoardCalendarMeta> {
    return this.service.getCalendarMeta(account, user, period, filter);
  }
}
