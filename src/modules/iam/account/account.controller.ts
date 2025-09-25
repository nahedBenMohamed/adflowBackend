import {
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { PagingQuery, TransformToDto } from '@/common';

import { AuthData, AuthDataPrefetch, CurrentAuth, JwtAuthorized } from '../common';

import { AccountDto, FindFilterDto } from './dto';
import { AccountService } from './account.service';

const AccountLogoFile = {
  MaxSize: 5242880,
  Type: 'image/*',
};

@ApiTags('IAM/account')
@Controller('account')
@JwtAuthorized({ prefetch: { account: true } })
@TransformToDto()
export class AccountController {
  constructor(private service: AccountService) {}

  @ApiOperation({ summary: 'Get current account', description: 'Get current account' })
  @ApiOkResponse({ description: 'Account', type: AccountDto })
  @Get()
  async get(@CurrentAuth() { account }: AuthData) {
    return this.service.expandOne(account, ['logoUrl']);
  }

  @ApiOperation({ summary: 'Find accounts', description: 'Find accounts' })
  @ApiOkResponse({ description: 'Accounts', type: [AccountDto] })
  @AuthDataPrefetch({ user: true })
  @Get('search')
  async search(@CurrentAuth() { user }: AuthData, @Query() filter: FindFilterDto, @Query() paging: PagingQuery) {
    return this.service.searchSystem({ user, filter, paging });
  }

  @ApiOperation({ summary: 'Set account logo', description: 'Set account logo' })
  @ApiCreatedResponse({ description: 'Account', type: AccountDto })
  @Post('logo')
  @UseInterceptors(FileInterceptor('logo', { storage: memoryStorage() }))
  async setLogo(
    @CurrentAuth() { account, userId }: AuthData,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: AccountLogoFile.MaxSize }),
          new FileTypeValidator({ fileType: AccountLogoFile.Type }),
        ],
      }),
    )
    logo: Express.Multer.File,
  ) {
    return this.service.setLogo(account, userId, logo);
  }

  @ApiOperation({ summary: 'Remove account logo', description: 'Remove account logo' })
  @ApiOkResponse({ description: 'Account', type: AccountDto })
  @Delete('logo')
  async removeLogo(@CurrentAuth() { account }: AuthData) {
    return this.service.deleteLogo(account);
  }
}
