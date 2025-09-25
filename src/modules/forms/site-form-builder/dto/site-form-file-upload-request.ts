import { ApiProperty } from '@nestjs/swagger';

export class SiteFormFilesUploadRequest {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  files: unknown[];
}
