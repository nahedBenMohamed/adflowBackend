import { Body, Controller, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { FieldService } from './field.service';
import { CheckFormulaDto, FieldsSettingsDto } from './dto';

@ApiTags('crm/fields')
@Controller('/crm')
@JwtAuthorized()
@TransformToDto()
export class FieldController {
  constructor(private readonly service: FieldService) {}

  @ApiOkResponse({ description: 'Check formula', type: Boolean })
  @Post('fields/formula/check')
  public async checkFormula(@CurrentAuth() { accountId }: AuthData, @Body() dto: CheckFormulaDto) {
    return this.service.checkFormula({ accountId, ...dto });
  }

  @ApiCreatedResponse({ description: 'Update entity type field settings' })
  @Put('entity-types/:entityTypeId/fields-settings')
  public async updateFieldsSettings(
    @CurrentAuth() { accountId }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Body() dto: FieldsSettingsDto,
  ) {
    return await this.service.updateFieldsSettings({ accountId, entityTypeId, activeFieldCodes: dto.activeFieldCodes });
  }
}
