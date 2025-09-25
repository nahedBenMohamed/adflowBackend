import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';

import { TransformToDto } from '@/common';
import { StorageFile } from '@/modules/storage/types/storage-file';

import { AuthDataPrefetch } from '../common/decorators/auth-data-prefetch.decorator';
import { CurrentAuth } from '../common/decorators/current-auth.decorator';
import { JwtAuthorized } from '../common/decorators/jwt-authorized.decorator';
import { AuthData } from '../common/types/auth-data';

import { ChangeUserPasswordDto } from './dto/change-user-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';
import type { UserFindFilterDto } from './dto/user-find-filter.dto';

const UserAvatarFile = {
  MaxSize: 5242880,
  Type: 'image/*',
};

@ApiTags('IAM/users')
@Controller('users')
@JwtAuthorized({ prefetch: { account: true } })
@TransformToDto()
export class UserController {
  constructor(private readonly service: UserService) {}

  @ApiOperation({ summary: 'Create user', description: 'Create user' })
  @ApiBody({ type: CreateUserDto, required: true, description: 'Create user data' })
  @ApiCreatedResponse({ type: UserDto, description: 'Created user' })
  @Post()
  async create(@CurrentAuth() { account }: AuthData, @Body() dto: CreateUserDto) {
    return this.service.create({ account, dto });
  }

  @ApiOperation({ summary: 'Get user', description: 'Get user' })
  @ApiParam({ name: 'userId', type: Number, required: true, description: 'User ID' })
  @ApiOkResponse({ type: UserDto, description: 'User' })
  @Get(':userId')
  async getOne(@CurrentAuth() { account }: AuthData, @Param('userId', ParseIntPipe) userId: number) {
    return await this.service.findOne(
      { accountId: account.id, id: userId },
      { account, expand: ['avatarUrl', 'objectPermissions'] },
    );
  }

  @ApiOperation({ summary: 'Get users', description: 'Get users' })
  @ApiOkResponse({ type: [UserDto], description: 'Users' })
  @Get()
  async getMany(@CurrentAuth() { account }: AuthData, @Query() filter: UserFindFilterDto): Promise<UserDto[]> {
    return this.service.findMany(
      { accountId: account.id, fullName: filter?.fullName },
      { account, expand: ['avatarUrl', 'objectPermissions'] },
    );
  }

  @ApiOperation({ summary: 'Update user', description: 'Update user' })
  @ApiParam({ name: 'userId', type: Number, required: true, description: 'User ID' })
  @ApiBody({ type: UpdateUserDto, required: true, description: 'Update user data' })
  @ApiOkResponse({ type: UserDto, description: 'Updated user' })
  @Put(':userId')
  async updatePut(
    @CurrentAuth() { account }: AuthData,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.service.updateExt({ account, userId, dto });
  }

  @ApiOperation({ summary: 'Update user', description: 'Update user' })
  @ApiParam({ name: 'userId', type: Number, required: true, description: 'User ID' })
  @ApiBody({ type: UpdateUserDto, required: true, description: 'Update user data' })
  @ApiOkResponse({ type: UserDto, description: 'Updated user' })
  @Patch(':userId')
  async updatePatch(
    @CurrentAuth() { account }: AuthData,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.service.updateExt({ account, userId, dto });
  }

  @ApiOperation({ summary: 'Delete user', description: 'Soft delete user' })
  @ApiParam({ name: 'userId', type: Number, required: true, description: 'User ID' })
  @ApiQuery({ name: 'newUserId', type: Number, required: false, description: 'User ID to reassign data' })
  @ApiOkResponse()
  @AuthDataPrefetch({ user: true })
  @Delete(':userId')
  async delete(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('userId', ParseIntPipe) userId: number,
    @Query('newUserId') newUserId?: number,
  ) {
    await this.service.softDelete({ accountId, user, userId, newUserId: newUserId ? Number(newUserId) : undefined });
  }

  @ApiOperation({ summary: 'Change user password', description: 'Change user password' })
  @ApiBody({ type: ChangeUserPasswordDto, required: true, description: 'Change user password data' })
  @ApiOkResponse({ type: Boolean, description: 'Password changed' })
  @AuthDataPrefetch({ user: true })
  @Post('change-password')
  async changePassword(@CurrentAuth() { user }: AuthData, @Body() dto: ChangeUserPasswordDto): Promise<boolean> {
    return this.service.changePassword({ user, dto });
  }

  @ApiOperation({ summary: 'Upload user avatar', description: 'Upload user avatar' })
  @ApiParam({ name: 'userId', type: Number, required: true, description: 'User ID' })
  @ApiOkResponse({ type: UserDto, description: 'User' })
  @Post(':userId/avatar')
  @UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
  async uploadUserAvatar(
    @CurrentAuth() { account }: AuthData,
    @Param('userId', ParseIntPipe) userId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: UserAvatarFile.MaxSize }),
          new FileTypeValidator({ fileType: UserAvatarFile.Type }),
        ],
      }),
    )
    avatar: Express.Multer.File,
  ) {
    return this.service.setAvatar({ account, userId, file: StorageFile.fromMulter(avatar) });
  }

  @ApiOperation({ summary: 'Delete user avatar', description: 'Delete user avatar' })
  @ApiParam({ name: 'userId', type: Number, required: true, description: 'User ID' })
  @ApiOkResponse({ type: UserDto, description: 'User' })
  @Delete(':userId/avatar')
  async deleteUserAvatar(@CurrentAuth() { account }: AuthData, @Param('userId', ParseIntPipe) userId: number) {
    return this.service.removeAvatar({ account, userId });
  }
}
