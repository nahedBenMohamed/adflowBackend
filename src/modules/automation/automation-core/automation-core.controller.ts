import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { AutomationCoreService } from './automation-core.service';

@ApiExcludeController(true)
@Controller('core')
@JwtAuthorized({ access: { adminOnly: true } })
@TransformToDto()
export class AutomationCoreController {
  constructor(private readonly service: AutomationCoreService) {}

  @Get('processes')
  public async listProcessDefinitions() {
    return this.service.listProcessDefinitions();
  }

  @Delete('processes/:resourceKey')
  public async delete(@Param('resourceKey') resourceKey: string) {
    return this.service.deleteProcess(resourceKey);
  }
}
