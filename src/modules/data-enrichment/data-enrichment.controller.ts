import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { JwtAuthorized } from '@/modules/iam/common';

import { DataEnrichmentService } from './data-enrichment.service';
import { BankRequisitesDto, OrganizationRequisitesDto, PhoneUserInfoDto } from './dto';

@ApiTags('data-enrichment')
@Controller('data-enrichment')
@JwtAuthorized()
@TransformToDto()
export class DataEnrichmentController {
  constructor(private service: DataEnrichmentService) {}

  @ApiOperation({ summary: 'Get bank requisites by query', description: 'Get bank requisites by query' })
  @ApiQuery({ name: 'query', type: String, required: true, description: 'Query to get bank requisites from' })
  @ApiOkResponse({ description: 'Bank requisites', type: [BankRequisitesDto] })
  @Get('requisites/bank')
  public async getBankRequisites(@Query('query') query: string) {
    return this.service.getBankRequisites(query);
  }

  @ApiOperation({
    summary: 'Get organization requisites by query',
    description: 'Get organization requisites by query',
  })
  @ApiQuery({ name: 'query', type: String, required: true, description: 'Query to get organization requisites from' })
  @ApiOkResponse({ description: 'Organization requisites', type: [OrganizationRequisitesDto] })
  @Get('requisites/org')
  public async getOrgRequisites(@Query('query') query: string) {
    return this.service.getOrgRequisites(query);
  }

  @ApiOperation({
    summary: 'Get aggregated phone user info by phone number',
    description: 'Get aggregated phone user info by phone number',
  })
  @ApiQuery({ name: 'phone', type: String, required: true, description: 'Phone number to get aggregated info from' })
  @ApiOkResponse({ description: 'Phone user info', type: PhoneUserInfoDto })
  @Get('phone/aggregate')
  public async getPhoneInfo(@Query('phone') phone: string) {
    return this.service.getPhoneInfo(phone);
  }
}
