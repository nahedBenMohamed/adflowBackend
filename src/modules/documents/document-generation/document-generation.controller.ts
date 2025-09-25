import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { FileLinkDto } from '@/CRM/Service/FileLink/FileLinkDto';

import { CheckDocumentDto, CheckDocumentResultDto, CreateDocumentDto } from './dto';
import { DocumentGenerationService } from './document-generation.service';

@ApiTags('crm/documents/entities')
@Controller('/crm/documents')
@JwtAuthorized({ prefetch: { account: true, user: true } })
export class DocumentGenerationController {
  constructor(private readonly service: DocumentGenerationService) {}

  @ApiOkResponse({ description: 'Check entity placeholders', type: CheckDocumentResultDto })
  @Get('check')
  public async check(
    @CurrentAuth() { accountId, user }: AuthData,
    @Query() dto: CheckDocumentDto,
  ): Promise<CheckDocumentResultDto> {
    return await this.service.check(accountId, user, dto);
  }

  @ApiCreatedResponse({ description: 'Generated document', type: [FileLinkDto] })
  @Post('create')
  public async create(
    @CurrentAuth() { account, user }: AuthData,
    @Body() dto: CreateDocumentDto,
  ): Promise<FileLinkDto[]> {
    return await this.service.create(account, user, dto);
  }
}
