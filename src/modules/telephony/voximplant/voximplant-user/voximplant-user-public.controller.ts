import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { UsersQueueDto } from './dto';
import { VoximplantUserService } from './voximplant-user.service';

@ApiTags('telephony/voximplant/integration')
@Controller('integration/:applicationId/users')
export class VoximplantUserPublicController {
  constructor(private service: VoximplantUserService) {}

  @ApiCreatedResponse({ description: 'Get users queue and contact info', type: UsersQueueDto })
  @Get()
  public async getUsersQueue(
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @Query('phone') phone: string,
    @Query('viPhoneNumber') viPhoneNumber?: string | null,
  ) {
    return this.service.getUsersQueue(applicationId, { phone, viPhoneNumber });
  }
}
