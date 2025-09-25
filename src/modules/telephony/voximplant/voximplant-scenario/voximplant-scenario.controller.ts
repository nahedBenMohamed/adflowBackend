import { Body, Controller, Get, Post, Put, Param, ParseEnumPipe } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData, CurrentAuth, JwtAuthorized, UserAccess } from '@/modules/iam/common';

import { CallDirection } from '../common';
import { VoximplantScenariosDto } from './dto';
import { VoximplantScenarioService } from './voximplant-scenario.service';

@ApiTags('telephony/voximplant/scenarios')
@Controller('scenarios')
@JwtAuthorized()
@TransformToDto()
export class VoximplantScenarioController {
  constructor(private service: VoximplantScenarioService) {}

  @ApiCreatedResponse({ description: 'Create voximplant scenarios', type: VoximplantScenariosDto })
  @Post()
  @UserAccess({ adminOnly: true })
  public async create(@CurrentAuth() { accountId }: AuthData, @Body() dto: VoximplantScenariosDto) {
    return this.service.upsert(accountId, dto);
  }

  @ApiCreatedResponse({ description: 'Get voximplant scenarios', type: VoximplantScenariosDto })
  @Get()
  public async findOne(@CurrentAuth() { accountId }: AuthData) {
    return this.service.findOne(accountId);
  }

  @ApiCreatedResponse({
    description: 'Check contact creation voximplant scenario is manual',
    type: Boolean,
  })
  @Get('check-manual/:callDirection')
  public async checkContactsCreationScenarioIsManual(
    @CurrentAuth() { accountId }: AuthData,
    @Param('callDirection', new ParseEnumPipe(CallDirection)) callDirection: CallDirection,
  ): Promise<boolean> {
    return this.service.checkContactsCreationScenarioIsManual(accountId, callDirection);
  }

  @ApiCreatedResponse({ description: 'Update voximplant account' })
  @Put()
  @UserAccess({ adminOnly: true })
  public async update(@CurrentAuth() { accountId }: AuthData, @Body() dto: VoximplantScenariosDto) {
    return this.service.upsert(accountId, dto);
  }
}
