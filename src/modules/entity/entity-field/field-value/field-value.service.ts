import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { create, all, MathJsInstance } from 'mathjs';

import { DateUtil, isUnique, ObjectState } from '@/common';
import { StorageService } from '@/modules/storage/storage.service';

import { FieldType, FieldTypes, FormulaUtil } from '../common';
import { Field } from '../field/entities';
import { FieldService } from '../field/field.service';
import { FieldOptionService } from '../field-option/field-option.service';

import { CreateFieldValueDto, UpdateFieldValueDto, SimpleFieldValueDto } from './dto';
import { FieldValue } from './entities';
import {
  FieldPayloadChecklistItem,
  FieldPayloadOption,
  FieldPayloadOptions,
  FieldPayloadParticipants,
  FieldPayloadValue,
  FieldPayloadValues,
} from './types';

interface FindFilter {
  accountId: number;
  fieldId?: number | number[];
  entityId?: number;
  type?: FieldType | FieldType[];
  value?: string;
}
interface CalculateEntity {
  entityTypeId: number;
  entityId: number;
  recalculate?: boolean;
  children?: CalculateEntity[];
}

@Injectable()
export class FieldValueService {
  private readonly logger = new Logger(FieldValueService.name);
  private math: MathJsInstance;

  constructor(
    @InjectRepository(FieldValue)
    private readonly repository: Repository<FieldValue>,
    private readonly storageService: StorageService,
    private readonly fieldService: FieldService,
    private readonly fieldOptionService: FieldOptionService,
  ) {
    this.math = create(all, {});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.math.SymbolNode.onUndefinedSymbol = function (_name: string) {
      return 0;
    };
  }

  async createSimple(
    accountId: number,
    entityTypeId: number,
    entityId: number,
    dto: SimpleFieldValueDto,
  ): Promise<FieldValue | null> {
    if (dto.fieldType || dto.fieldName || dto.fieldId || dto.fieldCode) {
      const field = await this.fieldService.findOne({
        accountId,
        entityTypeId,
        type: dto.fieldType,
        name: dto.fieldName,
        id: dto.fieldId,
        code: dto.fieldCode,
      });
      if (field) {
        const payload = await this.getPayload({ accountId, field, dto });
        if (payload) {
          return this.upsert({ accountId, entityId, dto: { fieldId: field.id, fieldType: field.type, payload } });
        }
      }
    }

    return null;
  }

  async createManySimple({
    accountId,
    entityTypeId,
    entityId,
    dtos,
  }: {
    accountId: number;
    entityTypeId: number;
    entityId: number;
    dtos: SimpleFieldValueDto[];
  }): Promise<{ fieldValues: FieldValue[]; recalculate: boolean; updateParticipants: boolean; value?: number }> {
    const fieldValues = (
      await Promise.all(dtos.map((dto) => this.createSimple(accountId, entityTypeId, entityId, dto)))
    ).filter(Boolean);
    const recalculate = fieldValues.some((value) => FieldTypes.calculable.includes(value.fieldType));
    const updateParticipants = fieldValues.some((value) => FieldTypes.participant.includes(value.fieldType));
    const value = fieldValues.find((value) => value.fieldType === FieldType.Value)?.getValue<number>();

    return { fieldValues, recalculate, updateParticipants, value };
  }

  async findOne(filter: FindFilter): Promise<FieldValue | null> {
    return this.createFindQb(filter).getOne();
  }

  async findMany(filter: FindFilter): Promise<FieldValue[]> {
    return this.createFindQb(filter).getMany();
  }

  async processBatch({
    accountId,
    entityId,
    dtos,
  }: {
    accountId: number;
    entityId: number;
    dtos: UpdateFieldValueDto[];
  }): Promise<{ recalculate: boolean; updateParticipants: boolean; value?: number }> {
    if (!dtos) return { recalculate: false, updateParticipants: false };

    let recalculate = false;
    let updateParticipants = false;
    let value: number | undefined = undefined;
    for (const dto of dtos) {
      if ([ObjectState.Created, ObjectState.Updated].includes(dto.state)) {
        await this.setValue({ accountId, entityId, fieldId: dto.fieldId, dto });
      } else if (dto.state === ObjectState.Deleted) {
        await this.delete({ accountId, entityId, fieldId: dto.fieldId });
      }

      recalculate ||= FieldTypes.calculable.includes(dto.fieldType);
      updateParticipants ||= FieldTypes.participant.includes(dto.fieldType);
      if (dto.fieldType === FieldType.Value) {
        value = dto.payload?.value as number;
      }
    }
    return { recalculate, updateParticipants, value };
  }

  async setValue({
    accountId,
    entityId,
    fieldId,
    dto,
  }: {
    accountId: number;
    entityId: number;
    fieldId: number | null | undefined;
    dto: CreateFieldValueDto;
  }): Promise<void> {
    dto.fieldId = fieldId ?? dto.fieldId;
    try {
      await this.upsert({ accountId, entityId, dto });
    } catch (e) {
      this.logger.warn(
        `Set value error. accountId=${accountId}; entityId=${entityId}; fieldId=${fieldId}; dto=${JSON.stringify(dto)}`,
        (e as Error)?.stack,
      );
    }
  }

  async calculateFormulas({
    accountId,
    calcEntity,
    previousEntityIds,
    hasUpdates = true,
  }: {
    accountId: number;
    calcEntity: CalculateEntity;
    previousEntityIds: number[];
    hasUpdates: boolean;
  }) {
    const formulaFields = await this.fieldService.findMany({
      accountId,
      entityTypeId: calcEntity.entityTypeId,
      type: FieldTypes.formula,
    });
    const unprocessed =
      calcEntity.children?.filter((ce) => ce.recalculate && !previousEntityIds.includes(ce.entityId)) || [];
    if ((hasUpdates || formulaFields.length) && unprocessed.length) {
      await Promise.all(
        unprocessed.map((child) =>
          this.calculateFormulas({
            accountId,
            calcEntity: child,
            previousEntityIds: [...previousEntityIds, calcEntity.entityId],
            hasUpdates: formulaFields.length > 0,
          }),
        ),
      );
    }
    let formulaValueChanged = false;
    if (formulaFields.length) {
      const fieldValues = await this.getValuesForFormula({
        accountId,
        calcEntities: [calcEntity, ...(calcEntity.children || [])],
      });
      for (const formulaField of formulaFields) {
        const key = FormulaUtil.createFieldKey({ entityTypeId: calcEntity.entityTypeId, fieldId: formulaField.id });
        const value = formulaField.value ? this.math.evaluate(formulaField.value, fieldValues) : null;
        const currentValue = fieldValues.get(key);
        if (currentValue !== value && (formulaField.type === FieldType.Formula || value !== null)) {
          try {
            await this.setValue({
              accountId,
              entityId: calcEntity.entityId,
              fieldId: formulaField.id,
              dto: {
                fieldId: formulaField.id,
                fieldType: formulaField.type,
                payload: { value },
              },
            });
            fieldValues.set(key, value);
            formulaValueChanged = true;
          } catch (e) {
            this.logger.error(
              // eslint-disable-next-line max-len
              `Calculate formula error. accountId=${accountId}; entityId=${calcEntity.entityId}; fieldId=${formulaField.id}; value=${value}`,
              (e as Error)?.stack,
            );
          }
        }
      }
    }
    if (formulaValueChanged && unprocessed.length) {
      await Promise.all(
        unprocessed.map((child) =>
          this.calculateFormulas({
            accountId,
            calcEntity: child,
            previousEntityIds: [...previousEntityIds, calcEntity.entityId],
            hasUpdates: formulaFields.length > 0,
          }),
        ),
      );
    }
  }

  private async getValuesForFormula({
    accountId,
    calcEntities,
  }: {
    accountId: number;
    calcEntities: CalculateEntity[];
  }): Promise<Map<string, number>> {
    const values = new Map<string, number>();

    for (const calcEntity of calcEntities) {
      const fieldValues = await this.findMany({
        accountId,
        entityId: calcEntity.entityId,
        type: FieldTypes.calculable,
      });
      if (fieldValues.length) {
        for (const fieldValue of fieldValues) {
          const fieldKey = FormulaUtil.createFieldKey({
            entityTypeId: calcEntity.entityTypeId,
            fieldId: fieldValue.fieldId,
          });
          const currentValue = values.get(fieldKey);
          values.set(fieldKey, (currentValue || 0) + (fieldValue.getValue<number>() || 0));
        }
      }
    }

    return values;
  }

  async removeUser({ accountId, userId, newUserId }: { accountId: number; userId: number; newUserId?: number | null }) {
    if (newUserId) {
      await this.repository
        .createQueryBuilder()
        .update()
        .set({ payload: () => `'{ "value": ${newUserId} }'` })
        .where('account_id = :accountId', { accountId })
        .andWhere('field_type = :fieldType', { fieldType: FieldType.Participant })
        .andWhere(`(payload->>'value')::integer = :userId`, { userId })
        .execute();

      await this.repository
        .createQueryBuilder()
        .update()
        .set({
          payload: () =>
            // eslint-disable-next-line max-len
            `jsonb_set(payload, '{userIds}', (SELECT jsonb_agg(DISTINCT CASE WHEN elem::integer = ${userId} THEN ${newUserId} ELSE elem::integer END) FROM jsonb_array_elements(payload->'userIds') AS elem))`,
        })
        .where('account_id = :accountId', { accountId })
        .andWhere('field_type = :fieldType', { fieldType: FieldType.Participants })
        .andWhere(`payload->'userIds' @> jsonb_build_array(${userId})`)
        .execute();
    } else {
      await this.repository
        .createQueryBuilder()
        .delete()
        .where('account_id = :accountId', { accountId })
        .andWhere('field_type = :fieldType', { fieldType: FieldType.Participant })
        .andWhere(`(payload->>'value')::integer = :userId`, { userId })
        .execute();

      await this.repository
        .createQueryBuilder()
        .update()
        .set({
          payload: () =>
            // eslint-disable-next-line max-len
            `jsonb_set(payload, '{userIds}', (SELECT jsonb_agg(elem) FROM jsonb_array_elements(payload->'userIds') AS elem WHERE elem::integer != ${userId}))`,
        })
        .where('account_id = :accountId', { accountId })
        .andWhere('field_type = :fieldType', { fieldType: FieldType.Participants })
        .andWhere(`payload->'userIds' @> jsonb_build_array(${userId})`)
        .execute();
    }
  }

  private async getPayload({
    accountId,
    field,
    dto,
  }: {
    accountId: number;
    field: Field;
    dto: SimpleFieldValueDto;
  }): Promise<unknown | null> {
    if (dto.payload) {
      return dto.payload;
    }

    if (dto.value === null || dto.value === undefined) {
      return null;
    }

    if (FieldTypes.withOptions.includes(field.type)) {
      const options = await this.fieldOptionService.findMany({ accountId, fieldId: field.id });
      if (FieldTypes.select.includes(field.type)) {
        const option = options.find((option) => option.label === dto.value);
        if (option) {
          return this.formatPayload({ type: field.type, value: option.id });
        }
      } else if (FieldTypes.multiSelect.includes(field.type)) {
        const values = String(dto.value)
          .split(',')
          .map((v) => v.trim());
        const optionIds = options.filter((option) => values.includes(option.label.trim())).map((option) => option.id);
        if (optionIds.length) {
          return this.formatPayload({ type: field.type, value: optionIds });
        }
      }
    }

    return this.formatPayload({ type: field.type, value: dto.value });
  }

  private formatPayload({ type, value }: { type: FieldType; value: unknown }) {
    switch (type) {
      case FieldType.Text:
      case FieldType.RichText:
      case FieldType.Link:
        return { value: String(value) } as FieldPayloadValue<string>;
      case FieldType.Number:
      case FieldType.Value:
      case FieldType.Formula:
      case FieldType.Participant:
        return { value: Number(value) } as FieldPayloadValue<number>;
      case FieldType.MultiText:
      case FieldType.Phone:
      case FieldType.Email:
        return {
          values: Array.isArray(value) ? value.map((i) => String(i)) : [String(value)],
        } as FieldPayloadValues<string>;
      case FieldType.File:
        return {
          value: Array.isArray(value) ? value.map((i) => String(i)) : [String(value)],
        } as FieldPayloadValue<string[]>;
      case FieldType.Switch:
        return { value: Boolean(value) } as FieldPayloadValue<boolean>;
      case FieldType.Date: {
        const date = new Date(value as string | number | Date);
        return date && DateUtil.isValid(date) ? ({ value: date.toISOString() } as FieldPayloadValue<string>) : null;
      }
      case FieldType.Select:
      case FieldType.ColoredSelect:
        return { optionId: Number(value) } as FieldPayloadOption;
      case FieldType.MultiSelect:
      case FieldType.ColoredMultiSelect:
      case FieldType.CheckedMultiSelect:
        return {
          optionIds: Array.isArray(value) ? value.map((i) => Number(i)) : [Number(value)],
        } as FieldPayloadOptions;
      case FieldType.Participants:
        return {
          userIds: Array.isArray(value) ? value.map((i) => Number(i)) : [Number(value)],
        } as FieldPayloadParticipants;
      case FieldType.Checklist:
        return {
          value: Array.isArray(value)
            ? value.map((i) => ({ text: String(i), checked: false }))
            : [{ text: String(value), checked: false }],
        } as FieldPayloadValue<FieldPayloadChecklistItem[]>;
    }
  }

  private async upsert({
    accountId,
    entityId,
    dto,
  }: {
    accountId: number;
    entityId: number;
    dto: CreateFieldValueDto;
  }): Promise<FieldValue> {
    const newValue = FieldValue.fromDto(accountId, entityId, dto);

    if (newValue.fieldType === FieldType.File) {
      const oldValue = await this.findOne({ accountId, entityId, fieldId: newValue.fieldId });
      const currentFiles = oldValue?.getValue<string[]>() ?? [];
      const newFiles = newValue.getValue<string[]>() ?? [];
      const added = newFiles.filter((f) => !currentFiles.includes(f));
      if (added.length) {
        await this.storageService.markUsedMany({ accountId, ids: added });
      }
      const deleted = currentFiles.filter((f) => !newFiles.includes(f));
      if (deleted.length) {
        await this.storageService.delete({ accountId, id: deleted });
      }
    }

    await this.repository.upsert(newValue, ['fieldId', 'entityId']);

    return newValue;
  }

  private async delete({ accountId, entityId, fieldId }: { accountId: number; entityId: number; fieldId: number }) {
    const fieldValue = await this.findOne({ accountId, entityId, fieldId });
    if (fieldValue?.fieldType === FieldType.File) {
      await this.storageService.delete({ accountId, id: fieldValue.getValue<string[]>() });
    }

    await this.repository.delete({ accountId, fieldId, entityId });
  }

  async copyEntityFieldValues({
    accountId,
    sourceEntityId,
    targetEntityId,
  }: {
    accountId: number;
    sourceEntityId: number;
    targetEntityId: number;
  }) {
    const sourceFieldValues = await this.findMany({ accountId, entityId: sourceEntityId });
    for (const sourceFieldValue of sourceFieldValues) {
      await this.upsert({
        accountId,
        entityId: targetEntityId,
        dto: {
          fieldId: sourceFieldValue.fieldId,
          fieldType: sourceFieldValue.fieldType,
          payload: sourceFieldValue.payload,
        },
      });
    }
  }

  async getParticipantIds({ accountId, entityId }: { accountId: number; entityId: number }): Promise<number[] | null> {
    const participantIds: number[] = [];
    const [participant, participants] = await Promise.all([
      this.findMany({ accountId, entityId, type: FieldType.Participant }),
      this.findMany({ accountId, entityId, type: FieldType.Participants }),
    ]);
    participant.forEach((f) => {
      const value = f.getValue<number>();
      if (value) participantIds.push(value);
    });
    participants.forEach((f) => {
      const values = f.getValue<number[]>();
      if (values?.length) participantIds.push(...values);
    });
    return participantIds.length ? participantIds.filter(isUnique) : null;
  }

  private createFindQb(filter: FindFilter) {
    const qb = this.repository.createQueryBuilder().where('account_id = :accountId', { accountId: filter.accountId });

    if (filter?.fieldId) {
      if (Array.isArray(filter.fieldId)) {
        qb.andWhere('field_id IN (:...fieldIds)', { fieldIds: filter.fieldId });
      } else {
        qb.andWhere('field_id = :fieldId', { fieldId: filter.fieldId });
      }
    }

    if (filter?.entityId) {
      qb.andWhere('entity_id = :entityId', { entityId: filter.entityId });
    }

    if (filter?.type) {
      if (Array.isArray(filter.type)) {
        qb.andWhere('field_type IN (:...types)', { types: filter.type });
      } else {
        qb.andWhere('field_type = :type', { type: filter.type });
      }
    }

    if (filter?.value) {
      qb.andWhere(`payload::jsonb::text ILIKE :value`, { value: `%${filter.value}%` });
    }

    return qb;
  }
}
