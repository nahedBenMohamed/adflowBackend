import { Body, Controller, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { DatePeriodDto, PagingQuery } from '@/common';
import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { ActivityCalendarMetaDto, ActivityCardDto, ActivityCardFilterDto, ActivityCardMetaDto } from './dto';
import { ActivityCardService } from './activity-card.service';

@ApiTags('crm/activity/card')
@Controller('/crm/activities')
@JwtAuthorized({ prefetch: { user: true } })
export class ActivityCardController {
  constructor(private readonly service: ActivityCardService) {}

  @ApiOkResponse({ description: 'Activities for board', type: [ActivityCardDto] })
  @Post('cards')
  public async getActivityCards(
    @CurrentAuth() { accountId, user }: AuthData,
    @Body() filter: ActivityCardFilterDto,
    @Query() paging: PagingQuery,
  ): Promise<ActivityCardDto[]> {
    return this.service.getActivityCards(accountId, user, filter, paging);
  }

  @ApiOkResponse({ description: 'Meta for activities board', type: ActivityCardMetaDto })
  @Post('cards/meta')
  public async getActivityCardsMeta(
    @CurrentAuth() { accountId, user }: AuthData,
    @Body() filter: ActivityCardFilterDto,
  ): Promise<ActivityCardMetaDto> {
    return this.service.getActivityCardsMeta(accountId, user, filter);
  }

  @ApiOkResponse({ description: 'Activity for board', type: ActivityCardDto })
  @Post('cards/:activityId')
  public async getActivityCard(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('activityId', ParseIntPipe) activityId: number,
    @Body() filter: ActivityCardFilterDto,
  ): Promise<ActivityCardDto | null> {
    return this.service.getActivityCard(accountId, user, activityId, filter);
  }

  @ApiOkResponse({ description: 'Activities calendar', type: [ActivityCardDto] })
  @Post('calendar')
  public async getActivityCalendar(
    @CurrentAuth() { accountId, user }: AuthData,
    @Body() filter: ActivityCardFilterDto,
    @Query() period: DatePeriodDto,
  ): Promise<ActivityCardDto[]> {
    return this.service.getActivityCalendar(accountId, user, period, filter);
  }

  @ApiOkResponse({ description: 'Meta for activities calendar', type: ActivityCalendarMetaDto })
  @Post('calendar/meta')
  public async getActivityCalendarMeta(
    @CurrentAuth() { accountId, user }: AuthData,
    @Body() filter: ActivityCardFilterDto,
    @Query() period: DatePeriodDto,
  ): Promise<ActivityCalendarMetaDto> {
    return this.service.getActivityCalendarMeta(accountId, user, period, filter);
  }
}
