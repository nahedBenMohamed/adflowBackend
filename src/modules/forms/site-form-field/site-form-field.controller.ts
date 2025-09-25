import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import type { AuthData } from '@/modules/iam/common/types/auth-data';

import { SiteFormFieldService } from './site-form-field.service';
import { SiteFormFieldDto, CreateSiteFormFieldDto, UpdateSiteFormFieldDto } from './dto';

@ApiTags('site-forms/fields')
@Controller(':formId/pages/:pageId/fields')
@JwtAuthorized({ access: { adminOnly: true } })
@TransformToDto()
export class SiteFormFieldController {
  constructor(private readonly service: SiteFormFieldService) {}

  @ApiCreatedResponse({ description: 'Create site form field', type: SiteFormFieldDto })
  @Post()
  public async create(
    @CurrentAuth() { accountId }: AuthData,
    @Param('pageId', ParseIntPipe) pageId: number,
    @Body() dto: CreateSiteFormFieldDto,
  ) {
    return this.service.create(accountId, pageId, dto);
  }

  @ApiOkResponse({ description: 'Get site form fields', type: [SiteFormFieldDto] })
  @Get()
  public async findMany(@CurrentAuth() { accountId }: AuthData, @Param('pageId', ParseIntPipe) pageId: number) {
    return this.service.findMany(accountId, { pageId });
  }

  @ApiOkResponse({ description: 'Get site form field', type: [SiteFormFieldDto] })
  @Get(':fieldId')
  public async findOne(
    @CurrentAuth() { accountId }: AuthData,
    @Param('pageId', ParseIntPipe) pageId: number,
    @Param('fieldId', ParseIntPipe) fieldId: number,
  ) {
    return this.service.findOne(accountId, { pageId, fieldId });
  }

  @ApiCreatedResponse({ description: 'Update site form field', type: SiteFormFieldDto })
  @Patch(':fieldId')
  public async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('pageId', ParseIntPipe) pageId: number,
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @Body() dto: UpdateSiteFormFieldDto,
  ) {
    return this.service.update(accountId, pageId, fieldId, dto);
  }

  @ApiOkResponse({ description: 'Delete site form field' })
  @Delete(':fieldId')
  public async delete(
    @CurrentAuth() { accountId }: AuthData,
    @Param('pageId', ParseIntPipe) pageId: number,
    @Param('fieldId', ParseIntPipe) fieldId: number,
  ) {
    return this.service.delete(accountId, pageId, fieldId);
  }
}
