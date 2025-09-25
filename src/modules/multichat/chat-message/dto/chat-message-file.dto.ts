import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ChatMessageFileDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  fileId: string | null;

  @ApiProperty()
  @IsString()
  fileName: string;

  @ApiProperty()
  @IsNumber()
  fileSize: number;

  @ApiProperty()
  @IsString()
  fileType: string;

  @ApiProperty()
  @IsString()
  downloadUrl: string;

  @ApiProperty()
  @IsString()
  createdAt: string;

  constructor(
    id: number,
    fileId: string | null,
    fileName: string,
    fileSize: number,
    fileType: string,
    createdAt: string,
    downloadUrl: string,
  ) {
    this.id = id;
    this.fileId = fileId;
    this.fileName = fileName;
    this.fileSize = fileSize;
    this.fileType = fileType;
    this.createdAt = createdAt;
    this.downloadUrl = downloadUrl;
  }
}
