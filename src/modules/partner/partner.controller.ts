import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { Subdomain, TransformToDto } from '@/common';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { UserDto } from '@/modules/iam/user/dto/user.dto';
import { JwtToken } from '@/modules/iam/authentication/dto/jwt-token';

import { PartnerLeadDto, PartnerLoginDto, PartnerSummaryDto } from './dto';
import { PartnerService } from './partner.service';

@ApiTags('partners')
@Controller('partners')
@TransformToDto()
export class PartnerController {
  constructor(private readonly service: PartnerService) {}

  @ApiOkResponse({ description: 'Jwt token to auth', type: JwtToken })
  @Post('login')
  public async login(@Subdomain() subdomain: string | null, @Body() dto: PartnerLoginDto): Promise<JwtToken | null> {
    return this.service.login(subdomain, dto.email, dto.password);
  }

  @ApiOkResponse({ description: 'Partner leads', type: [UserDto] })
  @JwtAuthorized()
  @Get(':partnerId/user')
  public async getUser(@CurrentAuth() { accountId }: AuthData, @Param('partnerId', ParseIntPipe) partnerId: number) {
    return this.service.getUser(accountId, partnerId);
  }

  @ApiOkResponse({ description: 'Partner leads', type: [PartnerLeadDto] })
  @JwtAuthorized()
  @Get(':partnerId/leads')
  public async getLeads(@CurrentAuth() { accountId }: AuthData, @Param('partnerId', ParseIntPipe) partnerId: number) {
    return this.service.getLeads(accountId, partnerId);
  }

  @ApiOkResponse({ description: 'Partner summary', type: PartnerSummaryDto })
  @JwtAuthorized()
  @Get(':partnerId/summary')
  public async getSummary(@CurrentAuth() { accountId }: AuthData, @Param('partnerId', ParseIntPipe) partnerId: number) {
    return this.service.getSummary(accountId, partnerId);
  }
}
