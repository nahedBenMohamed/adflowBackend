import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { DocumentTemplateDto, CreateDocumentTemplateDto, DocumentTemplateInfo, UpdateDocumentTemplateDto } from './dto';
import { DocumentTemplateService } from './document-template.service';

@ApiTags('crm/documents/templates')
@Controller('/crm/documents/templates')
@JwtAuthorized({ prefetch: { account: true } })
export class DocumentTemplateController {
  constructor(private readonly service: DocumentTemplateService) {}

  @ApiCreatedResponse({ description: 'Create document template', type: DocumentTemplateDto })
  @Post()
  public async create(
    @CurrentAuth() { account, userId }: AuthData,
    @Body() dto: CreateDocumentTemplateDto,
  ): Promise<DocumentTemplateDto> {
    return await this.service.create(account, userId, dto);
  }

  @ApiOkResponse({ description: 'Get document templates', type: [DocumentTemplateDto] })
  @Get()
  public async getMany(@CurrentAuth() { account }: AuthData): Promise<DocumentTemplateDto[]> {
    return await this.service.getDtoByAccount(account);
  }

  @ApiOkResponse({ description: 'Get document template', type: DocumentTemplateDto })
  @Get(':id')
  public async getOne(
    @CurrentAuth() { account }: AuthData,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DocumentTemplateDto> {
    return await this.service.getDtoById(account, id);
  }

  @ApiCreatedResponse({ description: 'Document templates info', type: [DocumentTemplateInfo] })
  @Get('entity-type/:entityTypeId')
  public async getAccessibleTemplates(
    @CurrentAuth() { accountId, userId }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
  ): Promise<DocumentTemplateInfo[]> {
    return await this.service.getAccessibleTemplates(accountId, userId, entityTypeId);
  }

  @ApiCreatedResponse({ description: 'Document template', type: DocumentTemplateDto })
  @Put(':id')
  public async update(
    @CurrentAuth() { account }: AuthData,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDocumentTemplateDto,
  ): Promise<DocumentTemplateDto> {
    return await this.service.update(account, id, dto);
  }

  @ApiOkResponse({ description: 'Delete document template' })
  @Delete(':id')
  public async delete(@CurrentAuth() { accountId }: AuthData, @Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.service.delete(accountId, id);
  }
}
