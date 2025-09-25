import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { JwtAuthorized } from '@/modules/iam/common';

import { VoximplantCoreService } from './voximplant-core.service';

@ApiTags('telephony/voximplant/core')
@Controller('core')
@JwtAuthorized()
@TransformToDto()
export class VoximplantCoreController {
  constructor(private service: VoximplantCoreService) {}

  @Get('children')
  public async getChildrenAccounts() {
    return this.service.getChildrenAccounts();
  }

  @Get('keys')
  public async getKeys() {
    return this.service.getKeys();
  }
}
