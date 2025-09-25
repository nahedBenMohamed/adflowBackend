import { Body, Controller, Post } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { ApiAccessRequired } from '@/modules/iam/common/decorators/api-access-required.decorator';
import { UnsubscribeDto } from './dto';

@ApiExcludeController(true)
@Controller()
@ApiAccessRequired()
export class UnsubscribeController {
  @Post('mailing/subscription/unsubscribe')
  async unsubscribe(@Body() dto: UnsubscribeDto): Promise<boolean> {
    return !!dto.entityId;
  }
}
