import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cell, CellRichTextValue, CellValue, Row, Workbook, Worksheet } from 'exceljs';

import { DateUtil, isUnique, UserNotification } from '@/common';
import { UserService } from '@/modules/iam/user/user.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { StorageFile } from '@/modules/storage/types/storage-file';

import { FieldType } from '@/modules/entity/entity-field/common/enums/field-type.enum';
import { FieldOption } from '@/modules/entity/entity-field/field-option/entities/field-option.entity';
import { FieldOptionService } from '@/modules/entity/entity-field/field-option/field-option.service';
import { FieldService } from '@/modules/entity/entity-field/field/field.service';
import { Field } from '@/modules/entity/entity-field/field/entities/field.entity';
import { SimpleFieldValueDto } from '@/modules/entity/entity-field/field-value/dto';

import { CrmEventType, EntityImportEvent } from '../../common';
import { Board } from '../../board';
import { BoardService } from '../../board/board.service';
import { BoardStage, BoardStageService } from '../../board-stage';
import { EntityType } from '../../entity-type/entities/entity-type.entity';
import { EntityTypeService } from '../../entity-type/entity-type.service';

import { EntityService } from '../Entity/EntityService';

type SystemFieldName = 'Board' | 'Stage' | 'Name' | 'Owner';
type SystemFieldType = Record<SystemFieldName, SystemFieldName>;
const SystemField: SystemFieldType = {
  Board: 'Board',
  Stage: 'Stage',
  Name: 'Name',
  Owner: 'Owner',
};
const SystemFields = [SystemField.Board, SystemField.Stage, SystemField.Name, SystemField.Owner];

interface ImportInfo {
  key: string | null;
  entityTypeId: number;
  fields: { fieldId: number | SystemFieldName; colNumber: number }[];
}

interface EntityIdWithKey {
  key: string;
  entityId: number;
}

@Injectable()
export class ImportService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UserService,
    private readonly entityTypeService: EntityTypeService,
    private readonly fieldService: FieldService,
    private readonly entityService: EntityService,
    private readonly boardService: BoardService,
    private readonly stageService: BoardStageService,
    private readonly fieldOptionService: FieldOptionService,
  ) {}

  public async generateTemplateForEntityType(accountId: number, entityTypeId: number) {
    const entityType = await this.entityTypeService.getById(accountId, entityTypeId);
    const linkedEntityTypes = await this.entityTypeService.findLinkedTypes(accountId, entityType.id);
    const entityTypes = [entityType, ...linkedEntityTypes];

    const fieldCodes: string[] = [];
    for (const et of entityTypes) {
      const prefix = et.id !== entityType.id ? '1//' : '';
      const boards = await this.boardService.findMany({ filter: { accountId, recordId: et.id } });
      if (boards && boards.length > 0) {
        fieldCodes.push(`${prefix}${et.name}//${SystemField.Board} {{${et.id}/${SystemField.Board}}}`);
        fieldCodes.push(`${prefix}${et.name}//${SystemField.Stage} {{${et.id}/${SystemField.Stage}}}`);
      }
      fieldCodes.push(`${prefix}${et.name}//${SystemField.Name} {{${et.id}/${SystemField.Name}}}`);
      fieldCodes.push(`${prefix}${et.name}//${SystemField.Owner} {{${et.id}/${SystemField.Owner}}}`);
      const fields = await this.fieldService.findMany({ accountId, entityTypeId: et.id });
      fieldCodes.push(...fields.map((field) => `${prefix}${et.name}//${field.name} {{${et.id}/${field.id}}}`));
    }

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(entityType.sectionView);
    worksheet.addRow(fieldCodes);

    // Set column widths to fit column name
    const numberOfColumns = worksheet.columns.length;
    for (let columnIndex = 1; columnIndex <= numberOfColumns; columnIndex++) {
      const columnWidth = this.calculateColumnWidth(worksheet, columnIndex);
      worksheet.getColumn(columnIndex).width = columnWidth;
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return buffer;
  }

  private calculateColumnWidth(worksheet: Worksheet, columnIndex: number) {
    let maxWidth = 0;
    worksheet.eachRow((row) => {
      const cellValue = row.getCell(columnIndex).value;
      const cellWidth = typeof cellValue === 'string' ? cellValue.length : String(cellValue).length;
      maxWidth = Math.max(maxWidth, cellWidth);
    });

    return maxWidth;
  }

  public async importDataBackground(accountId: number, user: User, entityTypeId: number, file: StorageFile) {
    this.importDataForEntityType(accountId, user, entityTypeId, file);
  }

  public async importDataForEntityType(accountId: number, user: User, entityTypeId: number, file: StorageFile) {
    const workbook = new Workbook();
    await workbook.xlsx.load(file.buffer);
    const worksheet = workbook.worksheets[0];

    const importInfos = this.processHeaderRow(worksheet.getRow(1));
    const mainEntityInfo = importInfos.find((ii) => ii.entityTypeId === entityTypeId);

    let totalCount = 0;
    let entityTypeName: string | null = null;

    if (mainEntityInfo) {
      const entityTypeIds = importInfos.map((ii) => ii.entityTypeId).filter(isUnique);
      const entityTypeCache = await this.getEntityTypeCache(accountId, entityTypeIds);
      const boardCache = await this.getBoardCache(accountId, entityTypeIds);
      const stageCache = await this.getStageCache(
        accountId,
        boardCache.map((b) => b.id),
      );
      const fieldCache = await this.getFieldCache(accountId, importInfos);
      const fieldOptionCache = await this.getFieldOptionCache(accountId, fieldCache);
      const userCache: User[] = [user];
      const linkedEntitiesInfo = importInfos.filter((ii) => ii.entityTypeId !== entityTypeId);

      for (let rowNumber = 2; rowNumber <= worksheet.lastRow.number; rowNumber++) {
        const result = await this.processDataRow(
          accountId,
          user,
          mainEntityInfo,
          linkedEntitiesInfo,
          worksheet.getRow(rowNumber),
          boardCache,
          stageCache,
          fieldCache,
          fieldOptionCache,
          userCache,
        );
        if (result) totalCount++;
      }

      entityTypeName = entityTypeCache.find((et) => et.id === entityTypeId)?.sectionName ?? null;
    }

    this.eventEmitter.emit(
      CrmEventType.EntityImportCompleted,
      new EntityImportEvent({
        accountId,
        userId: user.id,
        fileName: decodeURIComponent(file.originalName),
        entityTypeId,
        entityTypeName,
        totalCount,
      }),
    );
  }

  private processHeaderRow(row: Row): ImportInfo[] {
    const importInfo: ImportInfo[] = [];
    const regex = /(([^/]+)\/\/)?(?:.+)\/\/(?:.+)\s+{{(\d+)\/(\d+|Board|Stage|Name|Owner)}}/;

    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const cellValue = this.getCellValueAsString(cell.value);
      const match = cellValue.match(regex);
      if (match) {
        const [, , key, entityTypeIdStr, fieldIdStr] = match;
        const entityTypeId = parseInt(entityTypeIdStr);
        const fieldId = SystemFields.includes(fieldIdStr as SystemFieldName)
          ? (fieldIdStr as SystemFieldName)
          : parseInt(fieldIdStr);
        const entityType = importInfo.find((ii) => ii.key === key && ii.entityTypeId === entityTypeId);
        if (entityType) {
          if (!entityType.fields) entityType.fields = [];
          entityType.fields.push({ fieldId, colNumber });
        } else {
          importInfo.push({ key, entityTypeId, fields: [{ fieldId, colNumber }] });
        }
      }
    });
    return importInfo;
  }

  private async processDataRow(
    accountId: number,
    user: User,
    mainEntityInfo: ImportInfo,
    allEntityInfo: ImportInfo[],
    row: Row,
    boardCache: Board[],
    stageCache: BoardStage[],
    fieldCache: Field[],
    fieldOptionCache: FieldOption[],
    userCache: User[],
  ): Promise<boolean> {
    const mainEntity = await this.createEntity(
      accountId,
      user,
      mainEntityInfo,
      row,
      boardCache,
      stageCache,
      fieldCache,
      fieldOptionCache,
      userCache,
    );
    if (mainEntity) {
      const entitiesToLink: EntityIdWithKey[] = [];
      for (const entityInfo of allEntityInfo) {
        const linkedEntity = await this.createEntity(
          accountId,
          user,
          entityInfo,
          row,
          boardCache,
          stageCache,
          fieldCache,
          fieldOptionCache,
          userCache,
          mainEntity.id,
          entitiesToLink,
        );
        if (linkedEntity) entitiesToLink.push({ key: entityInfo.key, entityId: linkedEntity.id });
      }
    }
    return !!mainEntity;
  }

  private async createEntity(
    accountId: number,
    user: User,
    importInfo: ImportInfo,
    row: Row,
    boardCache: Board[],
    stageCache: BoardStage[],
    fieldCache: Field[],
    fieldOptionCache: FieldOption[],
    userCache: User[],
    mainEntityId?: number,
    entitiesToLink?: EntityIdWithKey[],
  ) {
    const fieldValues: SimpleFieldValueDto[] = [];
    let boardName: string | null = null;
    let stageName: string | null = null;
    let name: string | null = null;
    let owner: string | null = null;
    for (const fieldInfo of importInfo.fields) {
      if (fieldInfo.fieldId === SystemField.Board) {
        boardName = this.getCellValueAsString(row.getCell(fieldInfo.colNumber).value);
      } else if (fieldInfo.fieldId === SystemField.Stage) {
        stageName = this.getCellValueAsString(row.getCell(fieldInfo.colNumber).value);
      } else if (fieldInfo.fieldId === SystemField.Name) {
        name = this.getCellValueAsString(row.getCell(fieldInfo.colNumber).value);
      } else if (fieldInfo.fieldId === SystemField.Owner) {
        owner = this.getCellValueAsString(row.getCell(fieldInfo.colNumber).value);
      } else {
        const fieldId = Number(fieldInfo.fieldId);
        const field = fieldCache.find((f) => f.id === fieldId);
        if (field) {
          const fieldValue = await this.getFieldValue(field, row.getCell(fieldInfo.colNumber), fieldOptionCache);
          if (fieldValue) {
            fieldValues.push({ fieldId, payload: fieldValue });
          }
        }
      }
    }
    if (!name && !owner && !boardName && !stageName && fieldValues.length === 0) {
      return null;
    }

    const { boardId, stageId } = await this.getBoardAndStageIds(
      importInfo.entityTypeId,
      boardName,
      stageName,
      boardCache,
      stageCache,
    );

    const ownerId = await this.getResponsibleUserId(accountId, owner, user, userCache);
    const linkedEntities = mainEntityId ? [mainEntityId] : [];
    if (entitiesToLink && importInfo.key) {
      linkedEntities.push(
        ...entitiesToLink.filter((entity) => entity.key === importInfo.key).map((entity) => entity.entityId),
      );
    }

    const [entity] = await this.entityService.createSimple({
      accountId,
      user,
      dto: { entityTypeId: importInfo.entityTypeId, name, ownerId, boardId, stageId, fieldValues },
      options: { linkedEntities, userNotification: UserNotification.Suppressed },
    });

    return entity;
  }

  private async getEntityTypeCache(accountId: number, entityTypeIds: number[]): Promise<EntityType[]> {
    return await this.entityTypeService.findMany(accountId, { id: entityTypeIds });
  }

  private async getBoardCache(accountId: number, entityTypeIds: number[]): Promise<Board[]> {
    const boards: Board[] = [];
    for (const entityTypeId of entityTypeIds) {
      const etBoards = await this.boardService.findMany({ filter: { accountId, recordId: entityTypeId } });
      etBoards.forEach((b) => {
        if (b.sortOrder === 0) b['_first'] = true;
      });
      boards.push(...etBoards);
    }
    return boards;
  }

  private async getStageCache(accountId: number, boardIds: number[]): Promise<BoardStage[]> {
    const stages: BoardStage[] = [];
    for (const boardId of boardIds) {
      const boardStages = await this.stageService.findMany({ accountId, boardId });
      boardStages.forEach((s) => {
        if (s.sortOrder === 0) s['_first'] = true;
      });
      stages.push(...boardStages);
    }
    return stages;
  }

  private async getFieldCache(accountId: number, importInfos: ImportInfo[]): Promise<Field[]> {
    const fieldIds = importInfos
      .map((ii) => ii.fields)
      .flat()
      .filter((fi) => typeof fi.fieldId === 'number')
      .map((fi) => fi.fieldId as number)
      .filter(isUnique);
    return this.fieldService.findMany({ accountId, id: fieldIds });
  }

  private async getFieldOptionCache(accountId: number, fieldCache: Field[]): Promise<FieldOption[]> {
    const cache: FieldOption[] = [];
    for (const field of fieldCache) {
      cache.push(...(await this.fieldOptionService.findMany({ accountId, fieldId: field.id })));
    }
    return cache;
  }

  private async getBoardAndStageIds(
    entityTypeId: number,
    boardName: string | null,
    stageName: string | null,
    boardCache: Board[],
    stageCache: BoardStage[],
  ): Promise<{ boardId: number | null; stageId: number | null }> {
    const boards = boardCache.filter((b) => b.recordId === entityTypeId);
    if (boards?.length > 0) {
      const board = boardName
        ? boards.find((b) => b.name.toLowerCase() === boardName.toLowerCase())
        : (boards.find((b) => b['_first']) ?? boards[0]);
      if (board) {
        const stages = stageCache.filter((s) => s.boardId === board.id);
        const stage = stageName
          ? stages.find((s) => s.name.toLowerCase() === stageName.toLowerCase())
          : (stages.find((s) => s['_first']) ?? null);
        if (stage) return { boardId: board.id, stageId: stage.id };
      }
      return { boardId: board.id, stageId: null };
    }
    return { boardId: null, stageId: null };
  }

  private async getResponsibleUserId(
    accountId: number,
    owner: string | null,
    user: User,
    userCache: User[],
  ): Promise<number> {
    if (!owner) {
      return user.id;
    }

    const cachedUser = userCache.find((u) => u.fullName.toLowerCase() === owner.toLowerCase());
    if (cachedUser) {
      return cachedUser.id;
    }

    const dbUser = await this.userService.findOne({ accountId, fullName: owner });
    if (dbUser) {
      userCache.push(dbUser);

      return dbUser.id;
    }

    return user.id;
  }

  private async getFieldValue(field: Field, cell: Cell, fieldOptionCache: FieldOption[]): Promise<unknown> {
    const cellValue = cell.value;
    if (!cellValue) return null;
    const valueAsString = this.getCellValueAsString(cellValue);
    switch (field.type) {
      case FieldType.Text:
      case FieldType.RichText:
      case FieldType.Link:
        return { value: valueAsString };
      case FieldType.Number:
      case FieldType.Value:
      case FieldType.Formula:
        return { value: Number(cellValue) };
      case FieldType.MultiText:
      case FieldType.Phone:
      case FieldType.Email:
        return { values: valueAsString.split(/[,;]+/).map((v) => v.trim()) };
      case FieldType.Switch:
        return { value: Boolean(cellValue) };
      case FieldType.Date: {
        const date = cellValue ? new Date(cellValue as string | number | Date) : null;
        return { value: date && DateUtil.isValid(date) ? date.toISOString() : null };
      }
      case FieldType.Select:
      case FieldType.ColoredSelect: {
        const options = fieldOptionCache.filter((fo) => fo.fieldId === field.id);
        const option = options.find((o) => o.label === valueAsString);
        return { optionId: option ? option.id : null };
      }
      case FieldType.MultiSelect:
      case FieldType.ColoredMultiSelect:
      case FieldType.CheckedMultiSelect: {
        const multiOptions = fieldOptionCache.filter((fo) => fo.fieldId === field.id);
        const values = valueAsString.split(/[,;]+/).map((v) => v.trim());
        const fieldOptionIds = multiOptions
          .filter((o) => values.includes(o.label))
          .map((fo) => fo.id)
          .filter(isUnique);
        return { optionIds: fieldOptionIds?.length > 0 ? fieldOptionIds : [] };
      }
      case FieldType.Participant:
        return { value: Number(cellValue) };
      case FieldType.Participants:
        //TODO: parse participants
        return { userIds: [] };
      case FieldType.File:
        return { value: null };
      case FieldType.Checklist:
        return valueAsString
          .split(/[,;]+/)
          .map((v) => v.trim())
          .filter((v) => v.length)
          .map((v) => ({ text: v, checked: false }));
    }
  }

  private getCellValueAsString(cellValue: CellValue): string {
    if (!cellValue) return '';
    if (cellValue instanceof Date) {
      return DateUtil.formatPreset(cellValue, 'dateAndTime');
    }
    if (cellValue instanceof Object) {
      const anyValue = cellValue as any;
      if (anyValue.richText) {
        const value = anyValue as CellRichTextValue;
        return value.richText.map((i) => this.getCellValueAsString(i.text)).join('');
      }
      return this.getCellValueAsString(anyValue.error || anyValue.text || anyValue.result);
    }
    return String(cellValue).trim();
  }
}
