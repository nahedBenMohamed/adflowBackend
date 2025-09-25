import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import type { AuthData } from '@/modules/iam/common/types/auth-data';

import { SiteFormGratitudeService } from './site-form-gratitude.service';
import { SiteFormGratitudeDto, type CreateSiteFormGratitudeDto, type UpdateSiteFormGratitudeDto } from './dto';

@ApiTags('site-forms/gratitude')
@Controller(':formId/gratitude')
@JwtAuthorized({ access: { adminOnly: true } })
@TransformToDto()
export class SiteFormGratitudeController {
  constructor(private readonly service: SiteFormGratitudeService) {}

  @ApiCreatedResponse({ description: 'Create site form gratitude', type: SiteFormGratitudeDto })
  @Post()
  public async create(
    @CurrentAuth() { accountId }: AuthData,
    @Param('formId', ParseIntPipe) formId: number,
    @Body() dto: CreateSiteFormGratitudeDto,
  ) {
    return this.service.create(accountId, formId, dto);
  }

  @ApiOkResponse({ description: 'Get site form gratitude', type: [SiteFormGratitudeDto] })
  @Get()
  public async findOne(@CurrentAuth() { accountId }: AuthData, @Param('formId', ParseIntPipe) formId: number) {
    return this.service.findOne(accountId, { formId });
  }

  @ApiCreatedResponse({ description: 'Update site form gratitude', type: SiteFormGratitudeDto })
  @Patch()
  public async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('formId', ParseIntPipe) formId: number,
    @Body() dto: UpdateSiteFormGratitudeDto,
  ) {
    return this.service.update(accountId, formId, dto);
  }

  @ApiOkResponse({ description: 'Delete site form gratitude' })
  @Delete()
  public async delete(@CurrentAuth() { accountId }: AuthData, @Param('formId', ParseIntPipe) formId: number) {
    return this.service.delete(accountId, formId);
  }
}
