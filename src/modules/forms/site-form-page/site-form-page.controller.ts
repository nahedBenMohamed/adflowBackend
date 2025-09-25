import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

import { TransformToDto, ExpandQuery } from '@/common';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import type { AuthData } from '@/modules/iam/common/types/auth-data';

import { SiteFormPageService } from './site-form-page.service';
import { SiteFormPageDto, CreateSiteFormPageDto, UpdateSiteFormPageDto } from './dto';
import { ExpandableField } from './types';

@ApiTags('site-forms/pages')
@Controller(':formId/pages')
@JwtAuthorized({ access: { adminOnly: true } })
@TransformToDto()
export class SiteFormPageController {
  constructor(private readonly service: SiteFormPageService) {}

  @ApiCreatedResponse({ description: 'Create site form page', type: SiteFormPageDto })
  @Post()
  public async create(
    @CurrentAuth() { accountId }: AuthData,
    @Param('formId', ParseIntPipe) formId: number,
    @Body() dto: CreateSiteFormPageDto,
  ) {
    return this.service.create(accountId, formId, dto);
  }

  @ApiOkResponse({ description: 'Get site form pages', type: [SiteFormPageDto] })
  @ApiQuery({
    name: 'expand',
    type: String,
    required: false,
    isArray: true,
    description: 'Expand fields. Values: fields.',
  })
  @Get()
  public async findMany(
    @CurrentAuth() { accountId }: AuthData,
    @Param('formId', ParseIntPipe) formId: number,
    @Query() expand?: ExpandQuery<ExpandableField>,
  ) {
    return this.service.findMany(accountId, { formId }, { expand: expand.fields });
  }

  @ApiOkResponse({ description: 'Get site form page', type: [SiteFormPageDto] })
  @ApiQuery({
    name: 'expand',
    type: String,
    required: false,
    isArray: true,
    description: 'Expand fields. Values: fields.',
  })
  @Get(':pageId')
  public async findOne(
    @CurrentAuth() { accountId }: AuthData,
    @Param('formId', ParseIntPipe) formId: number,
    @Param('pageId', ParseIntPipe) pageId: number,
    @Query() expand?: ExpandQuery<ExpandableField>,
  ) {
    return this.service.findOne(accountId, { formId, pageId }, { expand: expand.fields });
  }

  @ApiCreatedResponse({ description: 'Update site form page', type: SiteFormPageDto })
  @Patch(':pageId')
  public async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('formId', ParseIntPipe) formId: number,
    @Param('pageId', ParseIntPipe) pageId: number,
    @Body() dto: UpdateSiteFormPageDto,
  ) {
    return this.service.update(accountId, formId, pageId, dto);
  }

  @ApiOkResponse({ description: 'Delete site form page' })
  @Delete(':pageId')
  public async delete(
    @CurrentAuth() { accountId }: AuthData,
    @Param('formId', ParseIntPipe) formId: number,
    @Param('pageId', ParseIntPipe) pageId: number,
  ) {
    return this.service.delete(accountId, formId, pageId);
  }
}
