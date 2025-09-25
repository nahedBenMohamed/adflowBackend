import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { DateUtil, TransformToDto } from '@/common';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { AuthData } from '@/modules/iam/common/types/auth-data';

import { TutorialFilterDto } from '../common';
import { TutorialCoreService } from './tutorial-core.service';

@ApiTags('tutorial')
@Controller('')
@JwtAuthorized()
@TransformToDto()
export class TutorialCoreController {
  constructor(private readonly service: TutorialCoreService) {}

  @ApiOperation({
    summary: 'Get tutorial items count',
    description: 'Get tutorial items count with filter and from date.',
  })
  @ApiQuery({ name: 'from', required: false, type: Date, description: 'From date in ISO format' })
  @ApiOkResponse({ description: 'Tutorial items count', type: Number })
  @Get('count')
  public async count(
    @CurrentAuth() { accountId }: AuthData,
    @Query() filter: TutorialFilterDto,
    @Query('from') from?: string,
  ) {
    return this.service.count(accountId, { ...filter, createdFrom: from ? DateUtil.fromISOString(from) : undefined });
  }
}
