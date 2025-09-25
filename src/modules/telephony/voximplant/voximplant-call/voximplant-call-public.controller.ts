import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { VoximplantCallDto, CreateVoximplantCallExtDto, UpdateVoximplantCallExtDto } from './dto';
import { VoximplantCallService } from './voximplant-call.service';

@ApiTags('telephony/voximplant/integration')
@Controller('integration/:applicationId/calls')
@TransformToDto()
export class VoximplantCallPublicController {
  constructor(private service: VoximplantCallService) {}

  @ApiCreatedResponse({ description: 'Create voximplant call', type: VoximplantCallDto })
  @Post()
  async createExt(
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @Body() dto: CreateVoximplantCallExtDto,
  ) {
    return this.service.createExt(applicationId, dto);
  }

  @ApiCreatedResponse({ description: 'Update voximplant call', type: VoximplantCallDto })
  @Patch(':externalId')
  async updateExt(
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @Param('externalId') externalId: string,
    @Body() dto: UpdateVoximplantCallExtDto,
  ) {
    return this.service.updateExt(applicationId, externalId, dto);
  }
}
