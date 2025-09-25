import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import sharp, { ResizeOptions } from 'sharp';
import { Readable } from 'stream';
import crypto from 'crypto';
import { lastValueFrom } from 'rxjs';
import * as mime from 'mime-types';

import { DateUtil, TokenService } from '@/common';
import { Account } from '@/modules/iam/account/entities/account.entity';

import { FileUploadResult, ImageOptionsDto } from './dto';
import { FileInfo } from './entities';
import { FileInfoResult, StorageFile, TemporaryFile } from './types';
import { AwsS3Provider } from './providers';
import { StorageUrlService } from './storage-url.service';

type Section = 'avatar' | 'logo' | 'photos' | string;
const getResizeOptions = (section: Section): ResizeOptions => {
  return section === 'avatar' ? { width: 440, height: 440 } : undefined;
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(FileInfo)
    private readonly repository: Repository<FileInfo>,
    private readonly tokenService: TokenService,
    private readonly awsS3Provider: AwsS3Provider,
    private readonly urlService: StorageUrlService,
  ) {}

  public async uploadCommonFiles({
    account,
    userId,
    files,
  }: {
    account: Account;
    userId?: number | null;
    files: Express.Multer.File[];
  }): Promise<FileUploadResult[]> {
    return Promise.all(files.map((file) => this.uploadCommonFile({ account, userId, file })));
  }

  public async uploadCommonFile({
    account,
    userId,
    file,
  }: {
    account: Account;
    userId?: number | null;
    file: Express.Multer.File;
  }): Promise<FileUploadResult | null> {
    const fileInfo = await this.storeCommonFile({ accountId: account.id, userId, file: StorageFile.fromMulter(file) });
    if (fileInfo) {
      const downloadUrl = this.urlService.getDownloadUrl(account.subdomain, fileInfo.id);
      const previewUrl = fileInfo.isImage()
        ? this.urlService.getImageUrl(account.id, account.subdomain, fileInfo.id)
        : undefined;
      return {
        key: file.fieldname,
        id: fileInfo.id,
        fileName: fileInfo.originalName,
        fileSize: fileInfo.size,
        mimeType: fileInfo.mimeType,
        createdAt: fileInfo.createdAt.toISOString(),
        downloadUrl,
        previewUrl,
      };
    }

    return null;
  }

  public async storeCommonFile({
    accountId,
    userId,
    file,
  }: {
    accountId: number;
    userId?: number | null;
    file: StorageFile;
  }): Promise<FileInfo | null> {
    const now = DateUtil.now();
    const path = `${accountId}/${now.getFullYear()}/${now.getMonth()}/${now.getDate()}`;

    return this.storeFile({ accountId, userId, path, file });
  }

  public async storeAccountFile({
    accountId,
    userId,
    file,
    section,
  }: {
    accountId: number;
    userId: number;
    file: StorageFile;
    section?: Section;
  }): Promise<FileInfo | null> {
    const path = `${accountId}/account${section ? `/${section}` : ''}`;

    return this.storeFile({ accountId, userId, path, file });
  }

  public async storeUserFile({
    accountId,
    userId,
    file,
    section,
  }: {
    accountId: number;
    userId: number;
    file: StorageFile;
    section?: Section;
  }): Promise<FileInfo | null> {
    const path = `${accountId}/users/${userId}${section ? `/${section}` : ''}`;

    return this.storeFile({ accountId, userId, path, file, resizeOptions: getResizeOptions(section) });
  }

  public async storeProductFiles({
    accountId,
    userId,
    productId,
    files,
    section,
  }: {
    accountId: number;
    userId: number;
    productId: number;
    files: StorageFile[];
    section?: Section;
  }): Promise<FileInfo[]> {
    const path = `${accountId}/products/${productId}${section ? `/${section}` : ''}`;

    return (await Promise.all(files.map((file) => this.storeFile({ accountId, userId, path, file })))).filter(Boolean);
  }

  public async storeExternalFile(
    accountId: number,
    userId: number | null,
    fileUrl: string,
    options?: { authorization?: string },
  ): Promise<FileInfo | null> {
    let response;
    try {
      const response$ = this.httpService.get(fileUrl, {
        headers: { Authorization: options?.authorization },
        responseType: 'arraybuffer',
      });
      response = await lastValueFrom(response$);
    } catch (e) {
      this.logger.error(`Error while storing external file`, (e as Error)?.stack);
      return null;
    }

    const { fileName, contentType } = this.extractFileInfo(response);
    const buffer = Buffer.from(response.data);

    return this.storeCommonFile({
      accountId,
      userId,
      file: new StorageFile(fileName, contentType, buffer.length, buffer),
    });
  }

  public async getFileInfo({ account, fileId }: { account: Account; fileId: string }): Promise<FileInfoResult | null> {
    const fileInfo = await this.repository.findOneBy({ id: fileId });
    if (fileInfo) {
      const downloadUrl = this.urlService.getDownloadUrl(account.subdomain, fileInfo.id);
      const previewUrl = fileInfo.isImage()
        ? this.urlService.getImageUrl(account.id, account.subdomain, fileInfo.id)
        : undefined;
      return new FileInfoResult({
        id: fileInfo.id,
        fileName: fileInfo.originalName,
        fileSize: fileInfo.size,
        mimeType: fileInfo.mimeType,
        createdAt: fileInfo.createdAt,
        downloadUrl,
        previewUrl,
      });
    }
    return null;
  }

  public async getFile({
    fileId,
    accountId,
  }: {
    fileId: string;
    accountId?: number;
  }): Promise<{ file: FileInfo; content: Uint8Array }> {
    const file = await this.repository.findOneBy({ id: fileId, accountId });
    if (file) {
      const content = await this.awsS3Provider.getFile(file.storePath);
      return { file, content };
    }
    return null;
  }

  public async getFileByTmpToken(token: string): Promise<{ file: FileInfo; content: Uint8Array }> {
    const { fileId } = this.tokenService.verify<TemporaryFile>(decodeURIComponent(token));

    return fileId ? this.getFile({ fileId }) : null;
  }

  public async getImage({
    accountId,
    id,
    options,
  }: {
    accountId: number;
    id: string;
    options?: ImageOptionsDto;
  }): Promise<{ content: Readable; mimeType: string }> {
    const file = await this.repository.findOneBy({ id, accountId });
    if (file) {
      const content = await this.awsS3Provider.getFile(file.storePath);
      if (options) {
        return {
          content: sharp(content).resize(options.width, options.height),
          mimeType: file.mimeType,
        };
      }
      return { content: Readable.from(content), mimeType: file.mimeType };
    }
    return null;
  }

  public async delete({ accountId, id }: { accountId: number; id: string | string[] }): Promise<boolean> {
    const deleteOne = async ({ accountId, id }: { accountId: number; id: string }): Promise<boolean> => {
      const file = await this.repository.findOneBy({ id, accountId });
      if (file) {
        const deleted = await this.awsS3Provider.deleteFile(file.storePath);
        if (deleted) {
          await this.repository.delete(id);
        }
        return deleted;
      }
      return true;
    };

    return Array.isArray(id)
      ? Promise.all(id.map((fileId) => deleteOne({ accountId, id: fileId }))).then((result) => result.every(Boolean))
      : deleteOne({ accountId, id });
  }

  public async markUsed({ accountId, id }: { accountId: number; id: string }): Promise<FileInfo> {
    await this.repository.update({ accountId, id }, { isUsed: true });
    return this.repository.findOneBy({ accountId, id });
  }
  public async markUsedMany({ accountId, ids }: { accountId: number; ids: string[] }): Promise<FileInfo[]> {
    return Promise.all(ids.map((id) => this.markUsed({ accountId, id })));
  }

  private async storeFile({
    accountId,
    userId,
    path,
    file,
    resizeOptions,
  }: {
    accountId: number;
    userId?: number | null;
    path: string;
    file: StorageFile;
    resizeOptions?: ResizeOptions;
  }): Promise<FileInfo | null> {
    const uploadFile = resizeOptions ? await this.resizeImage(file, resizeOptions) : file;
    const id = uuidv4();
    const key = `${path}/${id}`;
    const sha256Hash = crypto.createHash('sha256').update(uploadFile.buffer).digest('base64');
    const result = await this.awsS3Provider.storeBuffer(
      key,
      uploadFile.buffer,
      sha256Hash,
      uploadFile.mimeType,
      uploadFile.originalName,
    );
    if (result) {
      const fileInfo = new FileInfo(
        id,
        accountId,
        userId ?? null,
        decodeURI(file.originalName),
        uploadFile.mimeType,
        uploadFile.size,
        sha256Hash,
        key,
        false,
      );
      await this.repository.insert(fileInfo);

      return fileInfo;
    }

    return null;
  }

  private extractFileInfo(response: any): { fileName: string; contentType: string } {
    const contentType = response.headers['content-type'] as string;
    const contentDisposition = response.headers['content-disposition'];
    let fileName = '';
    if (contentDisposition) {
      //TODO: use StringUtil decoding
      const filenameRegex = /filename\*?=(?:[^\']*'')?([^;\n"']*)['"]?/;
      const matches = filenameRegex.exec(contentDisposition);
      if (matches != null && matches[1]) {
        fileName = matches[1].replace(/['"]/g, '');
      }
    }
    if (!fileName) {
      const extension = mime.extension(contentType) || 'bin';
      fileName = `${uuidv4()}.${extension}`;
    }

    return { fileName, contentType };
  }

  private async resizeImage(file: StorageFile, resizeOptions: ResizeOptions): Promise<StorageFile> {
    const resized = await sharp(file.buffer).resize(resizeOptions).toBuffer();
    return new StorageFile(file.originalName, file.mimeType, resized.length, resized);
  }
}
