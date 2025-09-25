import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { FieldSettingsDto, UpdateFieldSettingsDto } from './dto';
import { FieldSettingsService } from './field-settings.service';

@ApiTags('crm/fields')
@Controller('/crm/entity-types/:entityTypeId/fields')
@JwtAuthorized()
@TransformToDto()
export class FieldSettingsController {
  constructor(private readonly service: FieldSettingsService) {}

  @ApiOkResponse({ description: 'Get field settings', type: [FieldSettingsDto] })
  @Get('settings')
  public async updateEntity(
    @CurrentAuth() { accountId }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
  ) {
    return await this.service.findMany({ accountId, entityTypeId });
  }

  @ApiCreatedResponse({ description: 'Update field settings', type: FieldSettingsDto })
  @Post(':fieldId/settings')
  public async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @Body() dto: UpdateFieldSettingsDto,
  ) {
    return await this.service.update({ accountId, fieldId, dto });
  }
}
