import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrderValue, Repository } from 'typeorm';

import { FileLinkSource, NotFoundError } from '@/common';
import { Account } from '@/modules/iam/account/entities/account.entity';
import { StorageUrlService } from '@/modules/storage/storage-url.service';
import { StorageService } from '@/modules/storage/storage.service';

import { CrmEventType, FileLinkCreatedEvent, FileLinkEvent } from '../../common';

import { FileLink } from '../../Model/FileLink/FileLink';
import { FileLinkDto } from './FileLinkDto';

@Injectable()
export class FileLinkService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(FileLink)
    private readonly repository: Repository<FileLink>,
    private readonly storageService: StorageService,
    private readonly storageUrlService: StorageUrlService,
  ) {}

  private async create(
    accountId: number,
    sourceType: FileLinkSource,
    sourceId: number,
    fileInfoId: string,
  ): Promise<FileLink | null> {
    const fileInfo = await this.storageService.markUsed({ accountId, id: fileInfoId });
    if (!fileInfo) {
      return null;
    }
    const fileLink = await this.repository.save(
      new FileLink(
        accountId,
        sourceType,
        sourceId,
        fileInfoId,
        fileInfo.originalName,
        fileInfo.size,
        fileInfo.mimeType,
        fileInfo.createdBy,
        fileInfo.createdAt,
      ),
    );

    this.eventEmitter.emit(
      CrmEventType.FileLinkCreated,
      new FileLinkCreatedEvent({
        accountId,
        sourceType: fileLink.sourceType,
        sourceId: fileLink.sourceId,
        fileLinkId: fileLink.id,
        createdAt: fileLink.createdAt.toISOString(),
      }),
    );

    return fileLink;
  }
  public async addFile(
    account: Account,
    sourceType: FileLinkSource,
    sourceId: number,
    fileId: string,
  ): Promise<FileLinkDto | null> {
    const link = await this.create(account.id, sourceType, sourceId, fileId);
    return link ? this.getFileLinkDto(account, link) : null;
  }

  public async addFiles(
    account: Account,
    sourceType: FileLinkSource,
    sourceId: number,
    fileIds: string[],
  ): Promise<FileLinkDto[]> {
    const linkDtos: FileLinkDto[] = [];
    for (const file of fileIds) {
      const linkDto = await this.addFile(account, sourceType, sourceId, file);
      if (linkDto) linkDtos.push(linkDto);
    }
    return linkDtos;
  }

  public async findFileLinks(accountId: number, sourceType: FileLinkSource, sourceId: number): Promise<FileLink[]> {
    return await this.repository.find({ where: { accountId, sourceType, sourceId } });
  }

  public async findDtoById(account: Account, fileLinkId: number): Promise<FileLinkDto | null> {
    const link = await this.repository.findOneBy({ id: fileLinkId, accountId: account.id });
    return link ? this.getFileLinkDto(account, link) : null;
  }

  public async getFileLinkDtos(
    account: Account,
    sourceType: FileLinkSource,
    sourceId: number,
    order: FindOptionsOrderValue = 'ASC',
  ) {
    const links = await this.repository.find({
      where: { accountId: account.id, sourceType, sourceId },
      order: { id: order },
    });

    return links.map((link) => this.getFileLinkDto(account, link));
  }

  public async processFiles(accountId: number, sourceType: FileLinkSource, sourceId: number, fileIds: string[]) {
    const currentLinks = await this.repository.findBy({ accountId, sourceType, sourceId });
    const currentFiles = currentLinks ? currentLinks.map((link) => link.fileId) : [];

    const createdFiles = fileIds.filter((file) => !currentFiles.includes(file));
    for (const file of createdFiles) {
      await this.create(accountId, sourceType, sourceId, file);
    }

    const deletedFiles = currentFiles.filter((file) => !fileIds.includes(file));
    for (const file of deletedFiles) {
      await this.delete(accountId, sourceType, sourceId, file);
    }
  }

  public async deleteFileLink(accountId: number, id: number) {
    const link = await this.repository.findOneBy({ id, accountId });
    if (!link) {
      throw NotFoundError.withId(FileLink, id);
    }
    return await this.delete(accountId, link.sourceType, link.sourceId, link.fileId);
  }

  public async deleteFileLinks(accountId: number, ids: number[]): Promise<void> {
    await Promise.all(ids.map((id) => this.deleteFileLink(accountId, id)));
  }

  private getFileLinkDto(account: Account, link: FileLink): FileLinkDto {
    const downloadUrl = this.storageUrlService.getDownloadUrl(account.subdomain, link.fileId);
    const previewUrl = link.isImage()
      ? this.storageUrlService.getImageUrl(account.id, account.subdomain, link.fileId)
      : null;
    return FileLinkDto.create(link, downloadUrl, previewUrl);
  }

  private async delete(accountId: number, sourceType: FileLinkSource, sourceId: number, fileId: string) {
    const deleted = await this.storageService.delete({ accountId, id: fileId });
    if (deleted) {
      const fileLink = await this.repository.findOneBy({ accountId, sourceType, sourceId, fileId });
      await this.repository.delete({ accountId, sourceType, sourceId, fileId });
      if (fileLink) {
        this.eventEmitter.emit(
          CrmEventType.FileLinkDeleted,
          new FileLinkEvent({
            accountId,
            sourceType: fileLink.sourceType,
            sourceId: fileLink.sourceId,
            fileLinkId: fileLink.id,
          }),
        );
      }
    }
  }
}
