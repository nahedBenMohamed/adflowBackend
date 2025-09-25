import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { TimeBoardService } from '../../Service/TimeBoard/TimeBoardService';
import { TimeBoardMeta } from '../../Service/TimeBoard/TimeBoardMeta';
import { TimeBoardFilter } from '../../Service/TimeBoard/TimeBoardFilter';

@ApiTags('crm/tasks/time-board')
@Controller()
@JwtAuthorized({ prefetch: { user: true } })
export class GetTimeBoardMetaController {
  constructor(private readonly service: TimeBoardService) {}

  @ApiCreatedResponse({ description: 'Meta for time board', type: TimeBoardMeta })
  @Post('/crm/tasks/by_time/meta')
  public async getTimeBoardMeta(
    @CurrentAuth() { accountId, user }: AuthData,
    @Body() filter: TimeBoardFilter,
  ): Promise<TimeBoardMeta> {
    return this.service.getTimeBoardMeta(accountId, user, filter);
  }
}
