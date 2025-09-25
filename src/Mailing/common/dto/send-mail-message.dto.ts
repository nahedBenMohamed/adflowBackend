import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

export class SendMailMessageDto {
  @ApiProperty()
  sentTo: string[];

  @ApiProperty()
  cc: string[] | null;

  @ApiProperty()
  bcc: string[] | null;

  @ApiProperty()
  replyTo: string | null;

  @ApiProperty()
  subject: string | null;

  @ApiProperty()
  contentText: string | null;

  @ApiProperty()
  contentHtml: string | null;

  @ApiProperty()
  replyToMessageId: number | null;

  @ApiProperty()
  entityId: number | null;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  fileIds: string[] | null | undefined;
}
