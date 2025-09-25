import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

import { ExpandQuery, TransformToDto } from '@/common';
import { AuthData, CurrentAuth, JwtAuthorized, UserAccess } from '@/modules/iam/common';

import {
  CreateVoximplantNumberDto,
  PhoneNumberDto,
  UpdateVoximplantNumberDto,
  VoximplantNumberDto,
  VoximplantNumberFilterDto,
} from './dto';
import { ExpandableField } from './types';
import { VoximplantNumberService } from './services';

@ApiTags('telephony/voximplant/numbers')
@Controller('numbers')
@JwtAuthorized()
@TransformToDto()
export class VoximplantNumberController {
  constructor(private readonly service: VoximplantNumberService) {}

  @ApiOkResponse({ description: 'Get available voximplant numbers', type: [PhoneNumberDto] })
  @Get('available')
  public async getAvailableNumbers(@CurrentAuth() { accountId }: AuthData) {
    return this.service.getAvailableNumbers(accountId);
  }

  @ApiCreatedResponse({ description: 'Create voximplant number', type: VoximplantNumberDto })
  @Post()
  @UserAccess({ adminOnly: true })
  public async create(@CurrentAuth() { accountId }: AuthData, @Body() dto: CreateVoximplantNumberDto) {
    return this.service.create(accountId, dto);
  }

  @ApiOkResponse({ description: 'Get voximplant numbers', type: [VoximplantNumberDto] })
  @ApiQuery({
    name: 'expand',
    type: String,
    required: false,
    isArray: true,
    description: 'Expand fields. Values: users.',
  })
  @Get()
  public async getMany(
    @CurrentAuth() { accountId }: AuthData,
    @Query() filter: VoximplantNumberFilterDto,
    @Query() expand?: ExpandQuery<ExpandableField>,
  ) {
    return this.service.findMany(accountId, filter, { expand: expand.fields });
  }

  @ApiOkResponse({ description: 'Get voximplant number', type: VoximplantNumberDto })
  @ApiQuery({
    name: 'expand',
    type: String,
    required: false,
    isArray: true,
    description: 'Expand fields. Values: users.',
  })
  @Get(':numberId')
  public async getOne(
    @CurrentAuth() { accountId }: AuthData,
    @Param('numberId', ParseIntPipe) numberId: number,
    @Query() expand?: ExpandQuery<ExpandableField>,
  ) {
    return this.service.findOne(accountId, { id: numberId }, { expand: expand.fields });
  }

  @ApiCreatedResponse({ description: 'Update voximplant number', type: VoximplantNumberDto })
  @Patch(':numberId')
  @UserAccess({ adminOnly: true })
  public async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('numberId', ParseIntPipe) numberId: number,
    @Body() dto: UpdateVoximplantNumberDto,
  ) {
    return this.service.update(accountId, numberId, dto);
  }

  @ApiOkResponse({ description: 'Delete voximplant number' })
  @Delete(':numberId')
  @UserAccess({ adminOnly: true })
  public async delete(@CurrentAuth() { accountId }: AuthData, @Param('numberId', ParseIntPipe) numberId: number) {
    return this.service.delete(accountId, numberId);
  }
}
