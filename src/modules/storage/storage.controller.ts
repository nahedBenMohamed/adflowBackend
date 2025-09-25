import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { memoryStorage } from 'multer';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { AuthDataPrefetch } from '@/modules/iam/common/decorators/auth-data-prefetch.decorator';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { StorageService } from './storage.service';
import { FilesUploadRequest } from './dto/file-upload-request';
import { FileUploadResult } from './dto/file-upload-result';
import { FileInfoResultDto } from './dto';

@ApiTags('storage')
@Controller('storage')
@JwtAuthorized()
export class StorageController {
  constructor(private readonly service: StorageService) {}

  @ApiOperation({ summary: 'Upload files', description: 'Upload files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Files to upload', type: FilesUploadRequest })
  @ApiOkResponse({ description: 'Uploaded files info', type: [FileUploadResult] })
  @AuthDataPrefetch({ account: true })
  @Post('upload')
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  async upload(
    @UploadedFiles()
    files: Express.Multer.File[],
    @CurrentAuth() { account, userId }: AuthData,
  ): Promise<FileUploadResult[]> {
    return this.service.uploadCommonFiles({ account, userId, files });
  }

  @ApiOperation({ summary: 'Get file info', description: 'Get file info' })
  @ApiParam({ name: 'fileId', description: 'File id', type: String, required: true })
  @ApiOkResponse({ description: 'File info', type: FileInfoResultDto })
  @AuthDataPrefetch({ account: true })
  @Get('info/:fileId')
  async info(@CurrentAuth() { account }: AuthData, @Param('fileId') fileId: string) {
    return this.service.getFileInfo({ account, fileId });
  }

  @ApiOperation({ summary: 'Get file from storage', description: 'Get file from storage' })
  @ApiParam({ name: 'fileId', description: 'File id', type: String, required: true })
  @ApiOkResponse({ description: 'File', type: StreamableFile })
  @Get('file/:fileId')
  async get(
    @CurrentAuth() { accountId }: AuthData,
    @Param('fileId') fileId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const result = await this.service.getFile({ fileId, accountId });
    if (result) {
      res.set({
        'Content-Type': result.file.mimeType,
        'Content-Disposition': `attachment; filename="${encodeURI(result.file.originalName)}"`,
      });
      if (result.file.hashSha256) {
        res.set('Digest', 'sha-256=' + result.file.hashSha256);
      }
      return new StreamableFile(result.content);
    }

    return null;
  }

  @ApiOperation({ summary: 'Delete file from storage', description: 'Delete file from storage' })
  @ApiParam({ name: 'id', description: 'File id', type: String, required: true })
  @ApiOkResponse({ description: 'Result', type: Boolean })
  @Delete('file/:id')
  async delete(@Param('id') id: string, @CurrentAuth() { accountId }: AuthData): Promise<boolean> {
    return this.service.delete({ accountId, id });
  }
}
