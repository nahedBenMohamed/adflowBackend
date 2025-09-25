import { ApiProperty } from '@nestjs/swagger';

export class AddEntityFilesDto {
  @ApiProperty()
  fileIds: string[];
}
