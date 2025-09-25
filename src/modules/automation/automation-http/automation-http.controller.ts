import { Body, Controller, Post } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { AuthData, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { ProcessDataDto } from './dto';
import { AutomationHttpService } from './automation-http.service';

@ApiExcludeController(true)
@Controller('http')
export class AutomationHttpController {
  constructor(private readonly service: AutomationHttpService) {}

  @JwtAuthorized({ access: { adminOnly: true } })
  @Post('process')
  async processAutomation(@CurrentAuth() { accountId }: AuthData, @Body() dto: ProcessDataDto) {
    return this.service.processAutomation({
      accountId,
      entityId: dto.entityId,
      entityStageId: dto.entityStageId,
      data: dto.data,
      settings: dto.settings,
    });
  }
}
