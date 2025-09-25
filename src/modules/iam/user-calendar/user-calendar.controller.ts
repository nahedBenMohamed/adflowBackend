import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { AuthData, CurrentAuth, JwtAuthorized } from '../common';

import { UserCalendarDto } from './dto';
import { UserCalendarService } from './services';

@ApiTags('IAM/users/calendar')
@Controller('users/:userId/calendar')
@JwtAuthorized()
@TransformToDto()
export class UserCalendarController {
  constructor(private readonly service: UserCalendarService) {}

  @ApiOperation({ summary: 'Create user calendar', description: 'Create user calendar' })
  @ApiParam({ name: 'userId', type: Number, description: 'User id', required: true })
  @ApiBody({ type: UserCalendarDto, required: true, description: 'Create user calendar data' })
  @ApiCreatedResponse({ type: UserCalendarDto, description: 'Created user calendar' })
  @Post()
  async create(
    @CurrentAuth() { accountId }: AuthData,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UserCalendarDto,
  ) {
    return this.service.create({ accountId, userId, dto });
  }

  @ApiOperation({ summary: 'Get user calendar', description: 'Get user calendar' })
  @ApiParam({ name: 'userId', type: Number, description: 'User id', required: true })
  @ApiOkResponse({ type: UserCalendarDto, description: 'User calendar' })
  @Get()
  async findOne(@CurrentAuth() { accountId }: AuthData, @Param('userId', ParseIntPipe) userId: number) {
    return this.service.findOne({ accountId, userId });
  }

  @ApiOperation({ summary: 'Update user calendar', description: 'Update user calendar' })
  @ApiParam({ name: 'userId', type: Number, description: 'User id', required: true })
  @ApiBody({ type: UserCalendarDto, required: true, description: 'Update user calendar data' })
  @ApiOkResponse({ type: UserCalendarDto, description: 'Updated user calendar' })
  @Patch()
  async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UserCalendarDto,
  ) {
    return this.service.update({ accountId, userId, dto });
  }

  @ApiOperation({ summary: 'Delete user calendar', description: 'Delete user calendar' })
  @ApiParam({ name: 'userId', type: Number, description: 'User id', required: true })
  @ApiOkResponse()
  @Delete()
  async delete(@CurrentAuth() { accountId }: AuthData, @Param('userId', ParseIntPipe) userId: number) {
    return this.service.delete({ accountId, userId });
  }
}
