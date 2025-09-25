import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import type { AuthData } from '@/modules/iam/common/types/auth-data';

import { SiteFormConsentService } from './site-form-consent.service';
import { SiteFormConsentDto, type CreateSiteFormConsentDto, type UpdateSiteFormConsentDto } from './dto';

@ApiTags('site-forms/consent')
@Controller(':formId/consent')
@JwtAuthorized({ access: { adminOnly: true } })
@TransformToDto()
export class SiteFormConsentController {
  constructor(private readonly service: SiteFormConsentService) {}

  @ApiCreatedResponse({ description: 'Create site form consent', type: SiteFormConsentDto })
  @Post()
  public async create(
    @CurrentAuth() { accountId }: AuthData,
    @Param('formId', ParseIntPipe) formId: number,
    @Body() dto: CreateSiteFormConsentDto,
  ) {
    return this.service.create(accountId, formId, dto);
  }

  @ApiOkResponse({ description: 'Get site form consent', type: [SiteFormConsentDto] })
  @Get()
  public async findOne(@CurrentAuth() { accountId }: AuthData, @Param('formId', ParseIntPipe) formId: number) {
    return this.service.findOne(accountId, { formId });
  }

  @ApiCreatedResponse({ description: 'Update site form consent', type: SiteFormConsentDto })
  @Patch()
  public async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('formId', ParseIntPipe) formId: number,
    @Body() dto: UpdateSiteFormConsentDto,
  ) {
    return this.service.update(accountId, formId, dto);
  }

  @ApiOkResponse({ description: 'Delete site form consent' })
  @Delete()
  public async delete(@CurrentAuth() { accountId }: AuthData, @Param('formId', ParseIntPipe) formId: number) {
    return this.service.delete(accountId, formId);
  }
}
