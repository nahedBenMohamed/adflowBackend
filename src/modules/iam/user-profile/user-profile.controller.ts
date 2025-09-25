import { Body, Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { AuthData, CurrentAuth, JwtAuthorized } from '../common';
import { UserProfileDto, UpdateUserProfileDto } from './dto';
import { UserProfileService } from './user-profile.service';

@ApiTags('IAM/users')
@Controller('users/:userId/profile')
@JwtAuthorized()
@TransformToDto()
export class UserProfileController {
  constructor(private readonly service: UserProfileService) {}

  @ApiOperation({ summary: 'Get user profile', description: 'Get user profile' })
  @ApiParam({ name: 'userId', description: 'User ID', type: Number, required: true })
  @ApiOkResponse({ type: UserProfileDto, description: 'User profile' })
  @Get()
  public async findOne(@CurrentAuth() { accountId }: AuthData, @Param('userId', ParseIntPipe) userId: number) {
    return this.service.findOne({ accountId, userId });
  }

  @ApiOperation({ summary: 'Update user profile', description: 'Update user profile' })
  @ApiParam({ name: 'userId', description: 'User ID', type: Number, required: true })
  @ApiBody({ type: UpdateUserProfileDto, description: 'Date for update user profile', required: true })
  @ApiOkResponse({ type: UserProfileDto, description: 'User profile' })
  @Patch()
  public async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.service.update({ accountId, userId, dto });
  }
}
