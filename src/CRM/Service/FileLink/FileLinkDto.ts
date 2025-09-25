import { ApiProperty } from '@nestjs/swagger';
import { FileLink } from '../../Model/FileLink/FileLink';

export class FileLinkDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  fileId: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  fileSize: number;

  @ApiProperty()
  fileType: string;

  @ApiProperty()
  downloadUrl: string;

  @ApiProperty()
  previewUrl: string | null;

  @ApiProperty()
  createdBy: number;

  @ApiProperty()
  createdAt: string;

  private constructor(
    id: number,
    fileId: string,
    fileName: string,
    fileSize: number,
    fileType: string,
    createdAt: string,
    createdBy: number,
    downloadUrl: string,
    previewUrl: string | null,
  ) {
    this.id = id;
    this.fileId = fileId;
    this.fileName = fileName;
    this.fileSize = fileSize;
    this.fileType = fileType;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.downloadUrl = downloadUrl;
    this.previewUrl = previewUrl;
  }

  public static create(fileLink: FileLink, downloadUrl: string, previewUrl: string | null) {
    return new FileLinkDto(
      fileLink.id,
      fileLink.fileId,
      fileLink.fileName,
      fileLink.fileSize,
      fileLink.fileType,
      fileLink.createdAt.toISOString(),
      fileLink.createdBy,
      downloadUrl,
      previewUrl,
    );
  }
}
