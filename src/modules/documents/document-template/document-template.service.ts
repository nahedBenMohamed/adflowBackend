import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { FileLinkSource, NotFoundError } from '@/common';

import { Account } from '@/modules/iam/account/entities/account.entity';
import { FileLinkService } from '@/CRM/Service/FileLink/FileLinkService';

import { DocumentTemplateDto, DocumentTemplateInfo, CreateDocumentTemplateDto, UpdateDocumentTemplateDto } from './dto';
import { DocumentTemplate, DocumentTemplateAccess, DocumentTemplateEntityType } from './entities';

@Injectable()
export class DocumentTemplateService {
  constructor(
    @InjectRepository(DocumentTemplate)
    private readonly repositoryTemplate: Repository<DocumentTemplate>,
    @InjectRepository(DocumentTemplateAccess)
    private readonly repositoryTemplateUser: Repository<DocumentTemplateAccess>,
    @InjectRepository(DocumentTemplateEntityType)
    private readonly repositoryTemplateEntityType: Repository<DocumentTemplateEntityType>,
    private readonly fileLinkService: FileLinkService,
  ) {}

  public async create(account: Account, userId: number, dto: CreateDocumentTemplateDto): Promise<DocumentTemplateDto> {
    const template = await this.repositoryTemplate.save(new DocumentTemplate(account.id, dto.name, userId));
    if (dto.fileId) {
      await this.fileLinkService.processFiles(account.id, FileLinkSource.DOCUMENT_TEMPLATE, template.id, [dto.fileId]);
    }
    if (dto.accessibleBy?.length > 0) {
      await this.repositoryTemplateUser.insert(
        dto.accessibleBy.map((userId) => new DocumentTemplateAccess(account.id, template.id, userId)),
      );
    }
    if (dto.entityTypeIds?.length > 0) {
      await this.repositoryTemplateEntityType.insert(
        dto.entityTypeIds.map((entityTypeId) => new DocumentTemplateEntityType(account.id, template.id, entityTypeId)),
      );
    }
    return await this.getDtoByTemplate(account, template);
  }

  public async getById(accountId: number, id: number): Promise<DocumentTemplate> {
    const template = await this.repositoryTemplate.findOne({ where: { id, accountId } });
    if (!template) {
      throw NotFoundError.withId(DocumentTemplate, id);
    }
    return template;
  }

  public async getDtoById(account: Account, id: number): Promise<DocumentTemplateDto> {
    const template = await this.getById(account.id, id);
    return await this.getDtoByTemplate(account, template);
  }

  public async getDtoByAccount(account: Account): Promise<DocumentTemplateDto[]> {
    const templates = await this.repositoryTemplate.find({
      where: { accountId: account.id },
      order: { createdAt: 'ASC' },
    });
    return await Promise.all(templates.map((template) => this.getDtoByTemplate(account, template)));
  }

  public async getAccessibleTemplates(
    accountId: number,
    userId: number,
    entityTypeId: number,
  ): Promise<DocumentTemplateInfo[]> {
    const templates = await this.repositoryTemplate
      .createQueryBuilder('template')
      .leftJoin(DocumentTemplateAccess, 'accessible', 'template.id = accessible.document_template_id')
      .leftJoin(DocumentTemplateEntityType, 'et', 'template.id = et.document_template_id')
      .where('template.accountId = :accountId', { accountId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('template.createdBy = :userId', { userId }).orWhere('accessible.userId = :userId', { userId });
        }),
      )
      .andWhere('et.entityTypeId = :entityTypeId', { entityTypeId })
      .orderBy('template.created_at', 'ASC')
      .getMany();
    return templates.map((template) => new DocumentTemplateInfo(template.id, template.name));
  }

  public async getDtoByTemplate(account: Account, template: DocumentTemplate): Promise<DocumentTemplateDto> {
    const files = await this.fileLinkService.getFileLinkDtos(account, FileLinkSource.DOCUMENT_TEMPLATE, template.id);
    const accessibleBy = await this.repositoryTemplateUser.find({
      where: { documentTemplateId: template.id },
      select: ['userId'],
    });
    const entityTypeIds = await this.repositoryTemplateEntityType.find({
      where: { documentTemplateId: template.id },
      select: ['entityTypeId'],
    });
    return new DocumentTemplateDto(
      template.id,
      template.name,
      template.createdBy,
      files?.[0] ?? null,
      accessibleBy.map((access) => access.userId),
      entityTypeIds.map((entityType) => entityType.entityTypeId),
    );
  }

  public async update(account: Account, id: number, dto: UpdateDocumentTemplateDto): Promise<DocumentTemplateDto> {
    const template = await this.repositoryTemplate.findOne({ where: { id, accountId: account.id } });
    if (!template) {
      throw NotFoundError.withId(DocumentTemplate, id);
    }
    template.update(dto.name);
    await this.repositoryTemplate.save(template);

    await this.fileLinkService.processFiles(
      account.id,
      FileLinkSource.DOCUMENT_TEMPLATE,
      id,
      dto.fileId ? [dto.fileId] : [],
    );

    await this.repositoryTemplateUser.delete({ documentTemplateId: id });
    if (dto.accessibleBy?.length > 0) {
      await this.repositoryTemplateUser.insert(
        dto.accessibleBy.map((userId) => ({ documentTemplateId: id, userId, accountId: account.id })),
      );
    }

    await this.repositoryTemplateEntityType.delete({ documentTemplateId: id });
    if (dto.entityTypeIds?.length > 0) {
      await this.repositoryTemplateEntityType.insert(
        dto.entityTypeIds.map((entityTypeId) => ({ documentTemplateId: id, entityTypeId, accountId: account.id })),
      );
    }

    return await this.getDtoByTemplate(account, template);
  }

  public async delete(accountId: number, id: number): Promise<void> {
    await this.fileLinkService.processFiles(accountId, FileLinkSource.DOCUMENT_TEMPLATE, id, []);
    const result = await this.repositoryTemplate.delete({ id, accountId });
    if (result.affected === 0) {
      throw NotFoundError.withId(DocumentTemplate, id);
    }
  }

  public async incrementCreatedCount(template: DocumentTemplate): Promise<DocumentTemplate> {
    template.incrementCreatedCount();
    return await this.repositoryTemplate.save(template);
  }
}
