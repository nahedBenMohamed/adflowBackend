import { ApiProperty } from '@nestjs/swagger';

export class MailMessagePayloadDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  filename: string | null;

  @ApiProperty()
  content: string | null;

  @ApiProperty()
  size: number | null;

  @ApiProperty()
  sortOrder: number;
}
