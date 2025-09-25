import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Account } from '@/modules/iam/account/entities/account.entity';
import { StorageUrlService } from '@/modules/storage/storage-url.service';
import { StorageService } from '@/modules/storage/storage.service';

import { ChatMessageFile } from '../entities/chat-message-file.entity';

@Injectable()
export class ChatMessageFileService {
  constructor(
    @InjectRepository(ChatMessageFile)
    private readonly repository: Repository<ChatMessageFile>,
    private readonly storageService: StorageService,
    private readonly storageUrlService: StorageUrlService,
  ) {}

  public async addMessageFiles(account: Account, messageId: number, fileIds: string[]): Promise<ChatMessageFile[]> {
    const files: ChatMessageFile[] = [];
    for (const fileId of fileIds) {
      const fileInfo = await this.storageService.markUsed({ accountId: account.id, id: fileId });
      if (fileInfo) {
        const file = new ChatMessageFile(
          account.id,
          messageId,
          null,
          fileInfo.id,
          fileInfo.originalName,
          fileInfo.mimeType,
          fileInfo.size,
          fileInfo.createdAt,
        );

        file.downloadUrl = this.storageUrlService.getDownloadUrl(account.subdomain, file.fileId);

        files.push(await this.repository.save(file));
      }
    }
    return files;
  }

  public async updateMessageFiles(account: Account, messageId: number, fileIds: string[]): Promise<ChatMessageFile[]> {
    const currentFiles = await this.repository.findBy({ accountId: account.id, messageId });
    const currentFileIds = currentFiles.map((file) => file.fileId);

    const addedFileIds = fileIds.filter((fileId) => !currentFileIds.includes(fileId));
    const addedFiles = await this.addMessageFiles(account, messageId, addedFileIds);

    const deletedFiles = currentFiles.filter((file) => !fileIds.includes(file.fileId));
    await this.deleteFiles(account.id, messageId, deletedFiles);

    return currentFiles.filter((file) => !deletedFiles.includes(file)).concat(addedFiles);
  }

  public async deleteMessageFiles(accountId: number, messageId: number) {
    const files = await this.repository.findBy({ accountId, messageId });
    await this.deleteFiles(accountId, messageId, files);
  }

  public setFileDownloadUrl(account: Account, file: ChatMessageFile): ChatMessageFile {
    file.downloadUrl = this.storageUrlService.getDownloadUrl(account.subdomain, file.fileId);

    return file;
  }

  private async deleteFiles(accountId: number, messageId: number, files: ChatMessageFile[]) {
    for (const file of files) {
      const deleted = await this.storageService.delete({ accountId, id: file.fileId });
      if (deleted) {
        await this.repository.delete({ accountId, messageId, id: file.id });
      }
    }
  }
}
