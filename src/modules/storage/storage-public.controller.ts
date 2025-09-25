import { Controller, Get, Param, Query, Res, StreamableFile } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { ImageOptionsDto } from './dto';
import { StorageService } from './storage.service';

@ApiTags('storage')
@Controller('storage')
export class StoragePublicController {
  constructor(private readonly service: StorageService) {}

  @ApiOperation({ summary: 'Get image from storage', description: 'Get image from storage by account id' })
  @ApiParam({ name: 'accountId', type: Number, required: true, description: 'Account id' })
  @ApiParam({ name: 'id', type: String, required: true, description: 'Image id' })
  @ApiOkResponse({ description: 'Image file', type: StreamableFile })
  @Get('image/:accountId/:id')
  async getImage(
    @Param('accountId') accountId: number,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
    @Query() options?: ImageOptionsDto,
  ): Promise<StreamableFile> {
    const result = await this.service.getImage({ accountId, id, options });
    if (result) {
      res.set({
        'Content-Type': result.mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      });
      return new StreamableFile(result.content);
    }
    return null;
  }

  @ApiOperation({ summary: 'Get file from storage', description: 'Get file from storage by temporary token' })
  @ApiParam({ name: 'token', type: String, required: true, description: 'Temporary token' })
  @ApiOkResponse({ description: 'File', type: StreamableFile })
  @Get('tmp/:token')
  async getTemporaryFile(
    @Param('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const result = await this.service.getFileByTmpToken(token);
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
}
