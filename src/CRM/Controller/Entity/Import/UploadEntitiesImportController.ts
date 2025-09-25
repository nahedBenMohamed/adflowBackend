import {
  Controller,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { StorageFile } from '@/modules/storage/types/storage-file';

import { ImportService } from '../../../Service/Import/ImportService';

const ImportFile = {
  MaxSize: 10485760,
};

@ApiTags('crm/entities/import')
@Controller()
@JwtAuthorized({ prefetch: { user: true } })
export class UploadEntitiesImportController {
  constructor(private importService: ImportService) {}

  @Post('/crm/entities/:entityTypeId/import')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadImportData(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityTypeId') entityTypeId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: ImportFile.MaxSize })],
      }),
    )
    file: Express.Multer.File,
  ): Promise<void> {
    return await this.importService.importDataBackground(accountId, user, entityTypeId, StorageFile.fromMulter(file));
  }
}
