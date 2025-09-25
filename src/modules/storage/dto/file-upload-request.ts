import { ApiProperty } from '@nestjs/swagger';

export class FilesUploadRequest {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  files: any[];
}
