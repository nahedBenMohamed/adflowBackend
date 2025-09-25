import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

import PizZip from 'pizzip';
import Docxtemplater, { DXT } from 'docxtemplater';
import InspectModule from 'docxtemplater/js/inspect-module';
import expressionParser from 'docxtemplater/expressions.js';
import FormData from 'form-data';

import { DateUtil, FileLinkSource, isUnique, NotFoundError, NumberUtil } from '@/common';

import { Account } from '@/modules/iam/account/entities/account.entity';
import { User } from '@/modules/iam/user/entities/user.entity';
import { UserService } from '@/modules/iam/user/user.service';
import { AccountSettingsService } from '@/modules/iam/account-settings/account-settings.service';
import { MimeType } from '@/modules/storage/enums/mime-type.enum';
import { StorageService } from '@/modules/storage/storage.service';
import { StorageFile } from '@/modules/storage/types/storage-file';
import { OrderService } from '@/modules/inventory/order/services/order.service';
import { OrderHelper } from '@/modules/inventory/order/helper/order.helper';
import { FieldType } from '@/modules/entity/entity-field/common/enums/field-type.enum';
import { FieldOption } from '@/modules/entity/entity-field/field-option/entities/field-option.entity';
import { FieldValue } from '@/modules/entity/entity-field/field-value/entities/field-value.entity';
import { FieldPayloadChecklistItem } from '@/modules/entity/entity-field/field-value/types';
import { Field } from '@/modules/entity/entity-field/field/entities/field.entity';
import { FieldOptionService } from '@/modules/entity/entity-field/field-option/field-option.service';
import { FieldValueService } from '@/modules/entity/entity-field/field-value/field-value.service';
import { FieldService } from '@/modules/entity/entity-field/field/field.service';

import { EntityTypeService } from '@/CRM/entity-type/entity-type.service';
import { FileLink } from '@/CRM/Model/FileLink/FileLink';
import { EntityService } from '@/CRM/Service/Entity/EntityService';
import { FileLinkDto } from '@/CRM/Service/FileLink/FileLinkDto';
import { FileLinkService } from '@/CRM/Service/FileLink/FileLinkService';

import { DocumentsConfig } from '../config';
import { DocumentTemplateError } from '../common';
import { DocumentTemplateService } from '../document-template';
import { DocumentType, RussianCase } from './enums';
import { CheckDocumentResultDto, CheckDocumentMissingFieldDto, CreateDocumentDto, CheckDocumentDto } from './dto';
import { RussianName } from './types';

const CONVERT_DOCX_TO_PDF_PATH = 'convert/docx2pdf';

const SystemFields = {
  currentDate: 'currentDate',
  documentNumber: 'documentNumber',
};
const OrderFields = {
  _name: 'order',
  number: 'number',
  total: 'total',
  currency: 'currency',
  products: {
    _name: 'products',
    number: 'number',
    name: 'name',
    price: 'price',
    currency: 'currency',
    discount: 'discount',
    tax: 'tax',
    quantity: 'quantity',
    amount: 'amount',
  },
};

enum EntityTypeField {
  Name = 'name',
  Owner = 'owner',
}

const inclineName = (input: string, caseName: RussianCase) => {
  if (!input) return input;

  return RussianName.fromFullName(input).getFullName(caseName);
};

const numberToWord = (input: string, language: string) => {
  if (!input) return input;

  const value = Number(input);
  if (!value) return input;

  return NumberUtil.toWord(value, { language });
};

const numberToCurrency = (input: string, currency: string) => {
  if (!input) return input;

  const value = Number(input);
  if (!value) return input;

  return NumberUtil.toWord(value, { language: 'ru', currency });
};

@Injectable()
export class DocumentGenerationService {
  private _documentsHost: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly accountSettingsService: AccountSettingsService,
    private readonly userService: UserService,
    private readonly storageService: StorageService,
    @Inject(forwardRef(() => EntityService))
    private readonly entityService: EntityService,
    private readonly entityTypeService: EntityTypeService,
    private readonly fieldService: FieldService,
    private readonly fieldValueService: FieldValueService,
    private readonly fieldOptionService: FieldOptionService,
    private readonly fileLinkService: FileLinkService,
    private readonly orderService: OrderService,
    private readonly documentTemplateService: DocumentTemplateService,
  ) {
    this._documentsHost = this.configService.get<DocumentsConfig>('documents').host;
  }

  async check(accountId: number, user: User, dto: CheckDocumentDto) {
    try {
      const template = await this.documentTemplateService.getById(accountId, dto.templateId);
      const content = await this.getTemplateContent(accountId, template.id);
      const zip = new PizZip(content);
      const inspectModule = new InspectModule();
      new Docxtemplater(zip, { modules: [inspectModule] });
      const parts = inspectModule.getAllStructuredTags();
      const allTags = this.getTemplateAllTags(parts, null);

      const data = await this.getDataForGeneration({
        accountId,
        user,
        documentNumber: template.createdCount + 1,
        entityId: dto.entityId,
        orderId: dto.orderId,
      });
      const dataTags = this.getDataAllTags(null, data);

      const missingTags = allTags.filter((t) => !dataTags.includes(t));
      const missingFields: CheckDocumentMissingFieldDto[] = [];
      const removeTags: string[] = [];
      for (const tag of missingTags) {
        const tagParts = tag.split('.');
        const entityType = await this.entityTypeService.findOne(accountId, { name: tagParts[0] });
        if (entityType) {
          const field = await this.fieldService.findOne({ accountId, entityTypeId: entityType.id, name: tagParts[1] });
          if (field) {
            removeTags.push(tag);
            missingFields.push(new CheckDocumentMissingFieldDto({ entityTypeId: entityType.id, field: field.toDto() }));
          }
        }
      }

      const isCorrect = missingTags.length === 0 && missingFields.length === 0;
      return new CheckDocumentResultDto({ isCorrect, missingFields, missingTags });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: unknown) {
      throw new DocumentTemplateError();
    }
  }

  private getTemplateAllTags(parts: Docxtemplater.DXT.Part[], prefix: string | null): string[] {
    const tags: string[] = [];
    for (const part of parts) {
      if (part.type === 'placeholder') {
        const tag = `${prefix ? `${prefix}.` : ''}${part.value.split(' ')[0]}`;
        tags.push(tag);
        if (part.subparsed?.length > 0) {
          tags.push(...this.getTemplateAllTags(part.subparsed, tag));
        }
      }
    }
    return tags.filter(isUnique);
  }

  async create(account: Account, user: User, dto: CreateDocumentDto): Promise<FileLinkDto[]> {
    try {
      let template = await this.documentTemplateService.getById(account.id, dto.templateId);
      const content = await this.getTemplateContent(account.id, template.id);
      const data = await this.getDataForGeneration({
        accountId: account.id,
        user,
        documentNumber: template.createdCount + 1,
        entityId: dto.entityId,
        orderId: dto.orderId,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (expressionParser as any).filters.case = inclineName;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (expressionParser as any).filters.words = numberToWord;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (expressionParser as any).filters.currency = numberToCurrency;

      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        parser: expressionParser,
        nullGetter: this.nullGetter,
      });
      doc.render(data);
      const docBuffer = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });

      template = await this.documentTemplateService.incrementCreatedCount(template);

      const fileLinks: FileLinkDto[] = [];
      const documentName = `${template.name}_${template.createdCount}`;
      if (dto.types.includes(DocumentType.DOCX)) {
        const file = new StorageFile(
          `${documentName}.${DocumentType.DOCX}`,
          MimeType.DOCX,
          docBuffer.byteLength,
          docBuffer,
        );
        const fileInfo = await this.storageService.storeCommonFile({ accountId: account.id, userId: user.id, file });
        if (fileInfo) {
          const docLink = await this.fileLinkService.addFile(
            account,
            FileLinkSource.ENTITY_DOCUMENT,
            dto.entityId,
            fileInfo.id,
          );
          if (docLink) fileLinks.push(docLink);
        }
      }

      if (dto.types.includes(DocumentType.PDF)) {
        const pdfBuffer = await this.convertDocxToPdf(docBuffer, documentName);

        const file = new StorageFile(
          `${documentName}.${DocumentType.PDF}`,
          MimeType.PDF,
          pdfBuffer.byteLength,
          pdfBuffer,
        );
        const fileInfo = await this.storageService.storeCommonFile({ accountId: account.id, userId: user.id, file });
        if (fileInfo) {
          const pdfLink = await this.fileLinkService.addFile(
            account,
            FileLinkSource.ENTITY_DOCUMENT,
            dto.entityId,
            fileInfo.id,
          );
          if (pdfLink) fileLinks.push(pdfLink);
        }
      }

      return fileLinks;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: unknown) {
      throw new DocumentTemplateError();
    }
  }

  private async convertDocxToPdf(docBuffer: Buffer, documentName: string): Promise<Buffer> {
    const form = new FormData();
    form.append('file', docBuffer, `${documentName}.${DocumentType.DOCX}`);
    const response = await lastValueFrom(
      this.httpService.post(CONVERT_DOCX_TO_PDF_PATH, form, {
        baseURL: this._documentsHost,
        headers: {
          ...form.getHeaders(),
        },
        responseType: 'stream',
      }),
    );

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks = [];
      response.data.on('data', (chunk) => chunks.push(chunk));
      response.data.on('end', () => resolve(Buffer.concat(chunks)));
      response.data.on('error', reject);
    });
    return pdfBuffer;
  }

  private getDataAllTags(prefix: string | null, data: unknown): string[] {
    const tagNames: string[] = [];
    for (const [key, value] of Object.entries(data)) {
      const tag = `${prefix ? `${prefix}.` : ''}${key}`;
      tagNames.push(tag);
      if (Array.isArray(value)) {
        for (let idx = 0; idx < value.length; idx++) {
          tagNames.push(...this.getDataAllTags(tag, value[idx]));
          tagNames.push(...this.getDataAllTags(`${tag}[${idx}]`, value[idx]));
        }
      } else if (typeof value === 'object') {
        tagNames.push(...this.getDataAllTags(tag, value));
      }
    }
    return tagNames.filter(isUnique);
  }

  async getDataForGeneration({
    accountId,
    user,
    documentNumber,
    entityId,
    orderId,
  }: {
    accountId: number;
    user?: User | null;
    documentNumber?: number | null;
    entityId: number;
    orderId?: number | null;
  }) {
    const mainEntity = await this.entityService.findOne(accountId, { entityId });
    const linkedEntities = await this.entityService.findFirstLinkedEntityByType(accountId, entityId);
    const entities = [mainEntity, ...linkedEntities];

    const entityTypes = await this.getEntityTypesWithUniqueName(accountId);
    const fieldOptionCache: FieldOption[] = [];
    const data = {};
    data[`${SystemFields.currentDate}`] = DateUtil.formatPreset(DateUtil.now(), 'date');
    if (documentNumber) {
      data[`${SystemFields.documentNumber}`] = documentNumber;
    }
    for (const entity of entities) {
      const entityType = entityTypes.find((et) => et.id === entity.entityTypeId);
      const entityTypeName = this.removeSpecialChars(entityType.name);
      data[`${entityTypeName}`] = {};
      const fields = await this.getFieldsWithUniqueName(accountId, entity.entityTypeId);
      const fieldValues = await this.fieldValueService.findMany({ accountId, entityId: entity.id });
      const owner = await this.userService.findOne({ accountId, id: entity.responsibleUserId });
      data[`${entityTypeName}`][`${EntityTypeField.Name}`] = entity.name;
      data[`${entityTypeName}`][`${EntityTypeField.Owner}`] = owner.fullName;
      for (const fieldValue of fieldValues) {
        const field = fields.find((f) => f.id === fieldValue.fieldId);
        if (field) {
          const fieldValueObj = await this.getFieldValue(accountId, field, fieldValue, fieldOptionCache);
          if (fieldValueObj) {
            const fieldName = this.removeSpecialChars(field.name);
            data[`${entityTypeName}`][`${fieldName}`] = fieldValueObj;
          }
        }
      }
    }
    if (orderId && user) {
      const order = await this.orderService.findOne(accountId, user, { orderId }, { expand: ['items'] });
      if (order) {
        const accountSettings = await this.accountSettingsService.getOne(accountId);
        const currencyName = this.getCurrencyName(order.currency, accountSettings.language);
        const orderData = {};
        orderData[`${OrderFields.number}`] = order.orderNumber;
        orderData[`${OrderFields.total}`] = order.totalAmount;
        orderData[`${OrderFields.currency}`] = currencyName;
        const productsData = [];
        for (let idx = 0; idx < order.items.length; idx++) {
          const productData = {};
          productData[`${OrderFields.products.number}`] = idx + 1;
          productData[`${OrderFields.products.name}`] = order.items[idx].product.name;
          productData[`${OrderFields.products.price}`] = order.items[idx].unitPrice;
          productData[`${OrderFields.products.currency}`] = currencyName;
          productData[`${OrderFields.products.discount}`] = order.items[idx].discount;
          productData[`${OrderFields.products.tax}`] = order.items[idx].tax;
          productData[`${OrderFields.products.quantity}`] = order.items[idx].quantity;
          productData[`${OrderFields.products.amount}`] = OrderHelper.calcAmount(order.items[idx], order.taxIncluded);
          productsData.push(productData);
        }
        orderData[`${OrderFields.products._name}`] = productsData;
        data[`${OrderFields._name}`] = orderData;
      }
    }
    return data;
  }

  private getCurrencyName(currencyCode: string, locale = 'en-US'): string {
    const names = new Intl.DisplayNames(locale, { type: 'currency' });
    return names.of(currencyCode);
  }

  private async getTemplateContent(accountId: number, templateId: number) {
    const fileLinks = await this.fileLinkService.findFileLinks(accountId, FileLinkSource.DOCUMENT_TEMPLATE, templateId);
    if (fileLinks.length === 0) {
      throw NotFoundError.withMessage(FileLink, `with type ${FileLinkSource.DOCUMENT_TEMPLATE} is not found`);
    }

    const { content } = await this.storageService.getFile({ fileId: fileLinks[0].fileId, accountId });

    return content;
  }

  private async getEntityTypesWithUniqueName(accountId: number): Promise<{ id: number; name: string }[]> {
    const entityTypes = await this.entityTypeService.findMany(accountId);

    const countNames = entityTypes.reduce((acc, entityType) => {
      acc[entityType.name] = (acc[entityType.name] || 0) + 1;
      return acc;
    }, {});

    return entityTypes.map((entityType) => {
      if (countNames[entityType.name] > 1) {
        entityType.name = entityType.name + entityType.id;
      }
      return entityType;
    });
  }

  private async getFieldsWithUniqueName(accountId: number, entityTypeId: number): Promise<Field[]> {
    const fields = await this.fieldService.findMany({ accountId, entityTypeId });

    const countNames = fields.reduce((acc, field) => {
      acc[field.name] = (acc[field.name] || 0) + 1;
      return acc;
    }, {});

    return fields.map((field) => {
      if (countNames[field.name] > 1) {
        field.name = field.name + field.id;
      }
      return field;
    });
  }

  private removeSpecialChars(input: string): string {
    return input.replace(/[^\p{L}\p{N}]/gu, '');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private nullGetter(_part: DXT.Part) {
    return '';
  }

  private async getFieldValue(
    accountId: number,
    field: Field,
    fieldValue: FieldValue,
    fieldOptionCache: FieldOption[],
  ) {
    switch (field.type) {
      case FieldType.Text:
      case FieldType.RichText:
      case FieldType.Link:
        return fieldValue.getValue<string>();
      case FieldType.Number:
      case FieldType.Value:
      case FieldType.Formula:
        return fieldValue.getValue<number>();
      case FieldType.MultiText:
      case FieldType.Phone:
      case FieldType.Email:
      case FieldType.File:
        return fieldValue.getValue<string[]>()?.join(', ');
      case FieldType.Switch:
        return fieldValue.getValue<boolean>() ? 'Yes' : 'No';
      case FieldType.Date:
        return DateUtil.formatPreset(fieldValue.getValue<Date>(), 'date');
      case FieldType.Select:
      case FieldType.ColoredSelect: {
        let options = fieldOptionCache.filter((fo) => fo.fieldId === field.id);
        if (options.length === 0) {
          options = await this.fieldOptionService.findMany({ accountId, fieldId: field.id });
          fieldOptionCache.push(...options);
        }
        const fvOptionId = fieldValue.getValue<number>();
        const option = options.find((o) => o.id === fvOptionId);
        return option ? option.label : null;
      }
      case FieldType.MultiSelect:
      case FieldType.ColoredMultiSelect:
      case FieldType.CheckedMultiSelect: {
        let multiOptions = fieldOptionCache.filter((fo) => fo.fieldId === field.id);
        if (!multiOptions || multiOptions.length === 0) {
          multiOptions = await this.fieldOptionService.findMany({ accountId, fieldId: field.id });
          fieldOptionCache.push(...multiOptions);
        }
        const fvOptionIds = fieldValue.getValue<number[]>();
        const fieldOptions = fvOptionIds ? multiOptions.filter((o) => fvOptionIds.includes(o.id)) : null;
        return fieldOptions ? fieldOptions.map((o) => o.label).join(', ') : null;
      }
      case FieldType.Participant: {
        const fvUserId = fieldValue.getValue<number>();
        const user = await this.userService.findOne({ accountId, id: fvUserId });
        return user ? user.fullName : null;
      }
      case FieldType.Participants: {
        const fvUserIds = fieldValue.getValue<number[]>();
        if (fvUserIds) {
          const users = await Promise.all<User>(
            fvUserIds.map(async (id) => await this.userService.findOne({ accountId, id })),
          );
          return users.length > 0 ? users.map((u) => u.fullName).join(', ') : null;
        }
        return null;
      }
      case FieldType.Checklist: {
        const fvChecklist = fieldValue.getValue<FieldPayloadChecklistItem[]>();
        return fvChecklist
          ? fvChecklist
              .filter((v) => v.checked)
              .map((v) => v.text)
              .join(', ')
          : null;
      }
    }
  }
}
