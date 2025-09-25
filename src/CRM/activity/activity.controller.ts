import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { ActivityDto, CreateActivityDto, UpdateActivityDto } from './dto';
import { ActivityService } from './activity.service';

@ApiTags('crm/activity')
@Controller('crm/activities')
@JwtAuthorized({ prefetch: { account: true, user: true } })
export class ActivityController {
  constructor(private readonly service: ActivityService) {}

  @ApiCreatedResponse({ description: 'Create activity', type: ActivityDto })
  @Post()
  async create(@CurrentAuth() { account, user }: AuthData, @Body() dto: CreateActivityDto): Promise<ActivityDto> {
    return this.service.createAndGetDto(account, user, dto);
  }

  @ApiCreatedResponse({ description: 'Update activity', type: ActivityDto })
  @Patch(':activityId')
  async update(
    @CurrentAuth() { account, user }: AuthData,
    @Param('activityId', ParseIntPipe) activityId: number,
    @Body() dto: UpdateActivityDto,
  ): Promise<ActivityDto> {
    return this.service.update(account, user, activityId, dto);
  }

  @ApiOkResponse({ description: 'Delete activity' })
  @Delete(':activityId')
  async delete(@CurrentAuth() { accountId, user }: AuthData, @Param('activityId', ParseIntPipe) activityId: number) {
    await this.service.delete(accountId, user, activityId);
  }
}
