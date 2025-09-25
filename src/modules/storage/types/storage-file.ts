import { type FileInfo } from '../entities/file-info.entity';

export class StorageFile {
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
  encoding?: string | undefined;

  constructor(originalName: string, mimeType: string, size: number, buffer: Buffer, encoding?: string | undefined) {
    this.originalName = originalName;
    this.mimeType = mimeType;
    this.size = size;
    this.buffer = buffer;
    this.encoding = encoding;
  }

  public static fromFileInfo(fileInfo: FileInfo, buffer: Buffer) {
    return new StorageFile(fileInfo.originalName, fileInfo.mimeType, fileInfo.size, buffer);
  }

  public static fromMulter(file: Express.Multer.File) {
    return new StorageFile(decodeURIComponent(file.originalname), file.mimetype, file.size, file.buffer, file.encoding);
  }

  public static fromMulterFiles(files: Express.Multer.File[]): StorageFile[] {
    return files.map((file) => StorageFile.fromMulter(file));
  }
}
