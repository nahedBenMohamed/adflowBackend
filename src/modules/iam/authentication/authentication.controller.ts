import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { Subdomain } from '@/common';

import { AuthData } from '../common/types/auth-data';
import { ApiAccessRequired } from '../common/decorators/api-access-required.decorator';
import { CurrentAuth } from '../common/decorators/current-auth.decorator';
import { GAClientId } from '../common/decorators/ga-client-id.decorator';
import { JwtAuthorized } from '../common/decorators/jwt-authorized.decorator';

import {
  JwtToken,
  UserLoginDto,
  LoginLinkDto,
  DecodeLogicLinkDto,
  RecoveryUserPasswordDto,
  ResetUserPasswordDto,
} from './dto';
import { AuthenticationService } from './authentication.service';

@ApiTags('IAM/auth')
@Controller('auth')
@ApiAccessRequired()
export class AuthenticationController {
  constructor(private readonly service: AuthenticationService) {}

  @ApiCreatedResponse({ description: 'Jwt token to auth', type: JwtToken })
  @Post('login')
  public async loginBySubdomain(
    @Subdomain() subdomain: string | null,
    @GAClientId() gaClientId: string,
    @Body() dto: UserLoginDto,
  ): Promise<JwtToken> {
    return this.service.loginAndGetToken(dto.email, dto.password, gaClientId, subdomain);
  }

  @ApiCreatedResponse({ description: 'Login link for auth', type: LoginLinkDto })
  @Post('login-site')
  public async loginForSite(@GAClientId() gaClientId: string, @Body() dto: UserLoginDto): Promise<LoginLinkDto> {
    return this.service.loginAndGetLink(dto.email, dto.password, gaClientId);
  }

  @ApiCreatedResponse({ description: 'Jwt token to auth', type: JwtToken })
  @Post('login-ext')
  public async loginForExtension(@GAClientId() gaClientId: string, @Body() dto: UserLoginDto): Promise<JwtToken> {
    return this.service.loginAndGetToken(dto.email, dto.password, gaClientId);
  }

  @ApiCreatedResponse({ description: 'Jwt token to auth', type: JwtToken })
  @Post('decode-login-link')
  public async decodeLoginLink(@Body() dto: DecodeLogicLinkDto): Promise<JwtToken> {
    return await this.service.decodeLoginToken(dto.loginLink);
  }

  @ApiCreatedResponse({ description: 'Refreshed Jwt token', type: JwtToken })
  @JwtAuthorized()
  @Post('refresh-token')
  public async refreshToken(@CurrentAuth() { token }: AuthData): Promise<JwtToken> {
    return this.service.refreshJwtToken(token);
  }

  @Post('recovery-password')
  @ApiCreatedResponse({ type: Boolean })
  public async recoveryPassword(@Body() dto: RecoveryUserPasswordDto): Promise<boolean> {
    return this.service.recoveryPassword(dto);
  }

  @Post('reset-password')
  @ApiCreatedResponse({ type: LoginLinkDto })
  public async resetPassword(@Body() dto: ResetUserPasswordDto): Promise<LoginLinkDto> {
    return this.service.resetPassword(dto);
  }
}
