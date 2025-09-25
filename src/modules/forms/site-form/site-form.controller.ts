import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { TransformToDto, ExpandQuery } from '@/common';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import type { AuthData } from '@/modules/iam/common/types/auth-data';

import { SiteFormDto, CreateSiteFormDto, UpdateSiteFormDto } from './dto';
import { ExpandableField } from './types';
import { SiteFormService } from './services';

@ApiTags('site-forms')
@Controller()
@JwtAuthorized({ access: { adminOnly: true } })
@TransformToDto()
export class SiteFormController {
  constructor(private readonly service: SiteFormService) {}

  @ApiOperation({ summary: 'Create site form', description: 'Create site form' })
  @ApiBody({ type: CreateSiteFormDto, required: true, description: 'Site form data' })
  @ApiCreatedResponse({ description: 'Site form', type: SiteFormDto })
  @Post()
  public async create(@CurrentAuth() { accountId, userId }: AuthData, @Body() dto: CreateSiteFormDto) {
    return this.service.create(accountId, userId, dto);
  }

  @ApiOperation({ summary: 'Get site forms', description: 'Get site forms for account' })
  @ApiOkResponse({ description: 'Site forms', type: [SiteFormDto] })
  @ApiQuery({
    name: 'expand',
    type: String,
    required: false,
    isArray: true,
    description: 'Expand fields. Values: consent,gratitude,pages,pages.fields,entityTypeLinks',
  })
  @Get()
  public async findMany(@CurrentAuth() { accountId }: AuthData, @Query() expand?: ExpandQuery<ExpandableField>) {
    return this.service.findMany(accountId, {}, { expand: expand.fields });
  }

  @ApiOperation({ summary: 'Get site form', description: 'Get site form by id' })
  @ApiParam({ name: 'formId', type: Number, required: true, description: 'Site form id' })
  @ApiOkResponse({ description: 'Site form', type: [SiteFormDto] })
  @ApiQuery({
    name: 'expand',
    type: String,
    required: false,
    isArray: true,
    description: 'Expand fields. Values: consent,gratitude,pages,pages.fields,entityTypeLinks',
  })
  @Get(':formId')
  public async findOne(
    @CurrentAuth() { accountId }: AuthData,
    @Param('formId', ParseIntPipe) formId: number,
    @Query() expand?: ExpandQuery<ExpandableField>,
  ) {
    return this.service.findOne(accountId, { formId }, { expand: expand.fields });
  }

  @ApiOperation({ summary: 'Update site form', description: 'Update site form' })
  @ApiParam({ name: 'formId', type: Number, required: true, description: 'Site form id' })
  @ApiBody({ type: UpdateSiteFormDto, required: true, description: 'Site form data' })
  @ApiOkResponse({ description: 'Site form', type: SiteFormDto })
  @Patch(':formId')
  public async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('formId', ParseIntPipe) formId: number,
    @Body() dto: UpdateSiteFormDto,
  ) {
    return this.service.update(accountId, formId, dto);
  }

  @ApiOperation({ summary: 'Delete site form', description: 'Delete site form' })
  @ApiParam({ name: 'formId', type: Number, required: true, description: 'Site form id' })
  @ApiOkResponse()
  @Delete(':formId')
  public async delete(@CurrentAuth() { accountId }: AuthData, @Param('formId', ParseIntPipe) formId: number) {
    return this.service.delete(accountId, formId);
  }
}
