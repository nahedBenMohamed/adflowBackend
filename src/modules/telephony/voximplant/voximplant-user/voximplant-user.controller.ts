import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import {
  VoximplantUserDto,
  CreateVoximplantUserDto,
  CreateVoximplantUsersBatchDto,
  VoximplantUserSIPDataDto,
  UpdateVoximplantUserDto,
} from './dto';
import { VoximplantUserService } from './voximplant-user.service';

@ApiTags('telephony/voximplant/users')
@Controller('users')
@JwtAuthorized()
@TransformToDto()
export class VoximplantUserController {
  constructor(private readonly service: VoximplantUserService) {}

  @ApiCreatedResponse({ description: 'Create voximplant user', type: VoximplantUserDto })
  @Post(':userId')
  public async create(
    @CurrentAuth() { accountId }: AuthData,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateVoximplantUserDto,
  ) {
    return this.service.create(accountId, userId, dto);
  }

  @ApiCreatedResponse({ description: 'Batch create voximplant users', type: VoximplantUserDto, isArray: true })
  @Post('batch/create')
  public async createBatch(@CurrentAuth() { accountId }: AuthData, @Body() dto: CreateVoximplantUsersBatchDto) {
    return this.service.createBatch(accountId, dto);
  }

  @ApiOkResponse({ description: 'Get linked voximplant users', type: [VoximplantUserDto] })
  @Get()
  public async getMany(
    @CurrentAuth() { accountId }: AuthData,
    @Query('accessiblePhoneNumber') accessiblePhoneNumber?: string,
  ) {
    return this.service.findMany(accountId, { accessiblePhoneNumber });
  }

  @ApiOkResponse({ description: 'Get voximplant user', type: VoximplantUserDto })
  @Get(':userId')
  public async getOne(@CurrentAuth() { accountId }: AuthData, @Param('userId', ParseIntPipe) userId: number) {
    return this.service.findOne(accountId, { userId });
  }

  @ApiOkResponse({ description: 'Voximplant user name', type: String })
  @Get('my/username')
  public async getUserName(@CurrentAuth() { accountId, userId }: AuthData) {
    return this.service.getUserName(accountId, userId);
  }

  @ApiOkResponse({ description: 'Voximplant user login token', type: String })
  @Get('my/login-token')
  public async getLoginToken(@CurrentAuth() { accountId, userId }: AuthData, @Query('key') key: string) {
    return this.service.getLoginToken(accountId, userId, key);
  }

  @ApiOkResponse({ description: 'Voximplant user SIP data', type: VoximplantUserSIPDataDto })
  @Get(':userId/sip')
  public async getSIPData(@CurrentAuth() { accountId }: AuthData, @Param('userId', ParseIntPipe) userId: number) {
    return this.service.getSIPData(accountId, userId);
  }

  @ApiCreatedResponse({ description: 'Update voximplant user', type: VoximplantUserDto })
  @Patch(':userId')
  public async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateVoximplantUserDto,
  ) {
    return this.service.update(accountId, userId, dto);
  }

  @ApiOkResponse({ description: 'Delete voximplant user' })
  @Delete(':userId')
  public async delete(@CurrentAuth() { accountId }: AuthData, @Param('userId', ParseIntPipe) userId: number) {
    return this.service.delete(accountId, userId);
  }
}
