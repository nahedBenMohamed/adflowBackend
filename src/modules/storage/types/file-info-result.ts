import { FileInfoResultDto } from '../dto';

export class FileInfoResult {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  downloadUrl: string;
  previewUrl?: string | null;
  createdAt: Date;

  constructor(date: Omit<FileInfoResult, 'toDto'>) {
    this.id = date.id;
    this.fileName = date.fileName;
    this.fileSize = date.fileSize;
    this.mimeType = date.mimeType;
    this.downloadUrl = date.downloadUrl;
    this.previewUrl = date.previewUrl;
    this.createdAt = date.createdAt;
  }

  public toDto(): FileInfoResultDto {
    return {
      id: this.id,
      fileName: this.fileName,
      fileSize: this.fileSize,
      mimeType: this.mimeType,
      downloadUrl: this.downloadUrl,
      previewUrl: this.previewUrl,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
