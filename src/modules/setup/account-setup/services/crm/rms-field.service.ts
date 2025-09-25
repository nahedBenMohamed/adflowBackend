import { Injectable } from '@nestjs/common';

import { User } from '@/modules/iam/user/entities/user.entity';
import { FieldType, FieldTypes, FormulaUtil } from '@/modules/entity/entity-field/common';
import { FieldGroupService } from '@/modules/entity/entity-field/field-group/field-group.service';
import { Field, FieldService } from '@/modules/entity/entity-field/field';
import { FieldOptionService } from '@/modules/entity/entity-field/field-option/field-option.service';
import { FieldValueService } from '@/modules/entity/entity-field/field-value/field-value.service';
import {
  FieldPayloadOption,
  FieldPayloadOptions,
  FieldPayloadParticipants,
  FieldPayloadValue,
} from '@/modules/entity/entity-field/field-value/types';
import { FieldSettingsService } from '@/modules/entity/entity-field/field-settings/field-settings.service';
import { StorageService } from '@/modules/storage/storage.service';
import { StorageFile } from '@/modules/storage/types/storage-file';

@Injectable()
export class RmsFieldService {
  constructor(
    private readonly storageService: StorageService,
    private readonly fieldGroupService: FieldGroupService,
    private readonly fieldService: FieldService,
    private readonly fieldOptionService: FieldOptionService,
    private readonly fieldValueService: FieldValueService,
    private readonly fieldSettingsService: FieldSettingsService,
  ) {}

  public async copyAll(
    rmsAccountId: number,
    accountId: number,
    usersMap: Map<number, User>,
    entityTypesMap: Map<number, number>,
    entitiesMap: Map<number, number>,
    stagesMap: Map<number, number>,
  ) {
    const fieldGroupsMap = await this.copyFieldGroups(rmsAccountId, accountId, entityTypesMap);
    const fieldsMap = await this.copyFields(rmsAccountId, accountId, entityTypesMap, fieldGroupsMap);
    const fieldOptionsMap = await this.copyFieldOptions(rmsAccountId, accountId, fieldsMap);
    await this.copyFieldValues(rmsAccountId, accountId, usersMap, entitiesMap, fieldsMap, fieldOptionsMap);
    await this.copyFieldSettings(rmsAccountId, accountId, usersMap, fieldsMap, stagesMap);

    return fieldsMap;
  }

  private async copyFieldGroups(
    rmsAccountId: number,
    accountId: number,
    entityTypesMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const fieldGroupsMap = new Map<number, number>();

    for (const [rmsEntityTypeId, entityTypeId] of entityTypesMap) {
      const rmsFieldGroups = await this.fieldGroupService.findMany({
        accountId: rmsAccountId,
        entityTypeId: rmsEntityTypeId,
      });
      for (const rmsFieldGroup of rmsFieldGroups) {
        const fieldGroup = await this.fieldGroupService.create({
          accountId,
          entityTypeId,
          dto: { name: rmsFieldGroup.name, sortOrder: rmsFieldGroup.sortOrder },
        });
        fieldGroupsMap.set(rmsFieldGroup.id, fieldGroup.id);
      }
    }

    return fieldGroupsMap;
  }

  private async copyFields(
    rmsAccountId: number,
    accountId: number,
    entityTypesMap: Map<number, number>,
    fieldGroupsMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const fieldsMap = new Map<number, number>();

    for (const [rmsEntityTypeId, entityTypeId] of entityTypesMap) {
      const rmsFields = await this.fieldService.findMany({ accountId: rmsAccountId, entityTypeId: rmsEntityTypeId });
      for (const rmsField of rmsFields) {
        const field = await this.fieldService.create({
          accountId,
          entityTypeId,
          dto: {
            name: rmsField.name,
            type: rmsField.type,
            code: rmsField.code,
            active: rmsField.active,
            sortOrder: rmsField.sortOrder,
            entityTypeId: entityTypeId,
            fieldGroupId: fieldGroupsMap.get(rmsField.fieldGroupId),
            value: null,
          },
          options: { skipProcessing: true },
        });
        fieldsMap.set(rmsField.id, field.id);
      }
    }

    for (const [rmsEntityTypeId, entityTypeId] of entityTypesMap) {
      const rmsFields = await this.fieldService.findMany({
        accountId: rmsAccountId,
        entityTypeId: rmsEntityTypeId,
        type: FieldTypes.formula,
      });
      for (const rmsField of rmsFields.filter((f) => f.value)) {
        const fieldId = fieldsMap.get(rmsField.id);
        if (fieldId) {
          await this.fieldService.update({
            accountId,
            entityTypeId,
            fieldId,
            dto: { id: fieldId, value: this.copyFieldValue(rmsField, entityTypesMap, fieldsMap) },
            options: { skipProcessing: true },
          });
        }
      }
    }

    return fieldsMap;
  }

  private copyFieldValue(field: Field, entityTypesMap: Map<number, number>, fieldsMap: Map<number, number>): string {
    let formula = field.value;
    const formulaKeys = FormulaUtil.extractVariables(field.value);
    for (const formulaKey of formulaKeys) {
      const { entityTypeId: rmsEntityTypeId, fieldId: rmsFieldId } = FormulaUtil.parseFieldKey(formulaKey);
      const entityTypeId = entityTypesMap.get(rmsEntityTypeId);
      const fieldId = fieldsMap.get(rmsFieldId);
      if (entityTypeId && fieldId) {
        formula = formula.replace(formulaKey, FormulaUtil.createFieldKey({ entityTypeId, fieldId }));
      } else {
        formula = formula.replace(formulaKey, '0');
      }
    }

    return formula;
  }

  private async copyFieldOptions(
    rmsAccountId: number,
    accountId: number,
    fieldsMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const fieldOptionsMap = new Map<number, number>();

    for (const [rmsFieldId, fieldId] of fieldsMap) {
      const rmsFieldOptions = await this.fieldOptionService.findMany({ accountId: rmsAccountId, fieldId: rmsFieldId });
      for (const rmsFieldOption of rmsFieldOptions) {
        const option = await this.fieldOptionService.create({
          accountId,
          fieldId,
          dto: {
            label: rmsFieldOption.label,
            color: rmsFieldOption.color,
            sortOrder: rmsFieldOption.sortOrder,
          },
        });
        fieldOptionsMap.set(rmsFieldOption.id, option.id);
      }
    }

    return fieldOptionsMap;
  }

  private async copyFieldValues(
    rmsAccountId: number,
    accountId: number,
    usersMap: Map<number, User>,
    entitiesMap: Map<number, number>,
    fieldsMap: Map<number, number>,
    fieldOptionsMap: Map<number, number>,
  ): Promise<void> {
    for (const [rmsFieldId, fieldId] of fieldsMap) {
      const rmsFieldValues = await this.fieldValueService.findMany({ accountId: rmsAccountId, fieldId: rmsFieldId });
      for (const rmsFieldValue of rmsFieldValues) {
        const payload = rmsFieldValue.payload;
        if (FieldTypes.select.includes(rmsFieldValue.fieldType)) {
          (payload as FieldPayloadOption).optionId = fieldOptionsMap.get(rmsFieldValue.getValue<number>());
        } else if (FieldTypes.multiSelect.includes(rmsFieldValue.fieldType)) {
          (payload as FieldPayloadOptions).optionIds = rmsFieldValue
            .getValue<number[]>()
            .map((id) => fieldOptionsMap.get(id));
        } else if (rmsFieldValue.fieldType === FieldType.Participant) {
          (payload as FieldPayloadValue<number>).value = usersMap.get(rmsFieldValue.getValue<number>()).id;
        } else if (rmsFieldValue.fieldType === FieldType.Participants) {
          (payload as FieldPayloadParticipants).userIds = rmsFieldValue
            .getValue<number[]>()
            .filter((id: number) => usersMap.has(id))
            .map((id: number) => usersMap.get(id).id);
        } else if (rmsFieldValue.fieldType === FieldType.File) {
          const fileIds: string[] = [];
          const rmsFileIds = rmsFieldValue.getValue<string[]>();
          if (rmsFileIds?.length) {
            for (const rmsFileId of rmsFieldValue.getValue<string[]>()) {
              const { file, content } = await this.storageService.getFile({
                fileId: rmsFileId,
                accountId: rmsAccountId,
              });
              const fileInfo = await this.storageService.storeCommonFile({
                accountId,
                file: StorageFile.fromFileInfo(file, Buffer.from(content)),
              });
              fileIds.push(fileInfo.id);
            }
          }
          (payload as FieldPayloadValue<string[]>).value = fileIds.length ? fileIds : null;
        }

        await this.fieldValueService.setValue({
          accountId,
          entityId: entitiesMap.get(rmsFieldValue.entityId),
          fieldId,
          dto: {
            fieldId,
            fieldType: rmsFieldValue.fieldType,
            payload,
          },
        });
      }
    }
  }

  private async copyFieldSettings(
    rmsAccountId: number,
    accountId: number,
    usersMap: Map<number, User>,
    fieldsMap: Map<number, number>,
    stagesMap: Map<number, number>,
  ): Promise<void> {
    for (const [rmsFieldId, fieldId] of fieldsMap) {
      const rmsFieldSettings = await this.fieldSettingsService.findOne({
        accountId: rmsAccountId,
        fieldId: rmsFieldId,
      });
      if (rmsFieldSettings) {
        await this.fieldSettingsService.update({
          accountId,
          fieldId,
          dto: {
            excludeUserIds: rmsFieldSettings.excludeUserIds
              ? rmsFieldSettings.excludeUserIds.map((id) => usersMap.get(id).id)
              : null,
            readonlyUserIds: rmsFieldSettings.readonlyUserIds
              ? rmsFieldSettings.readonlyUserIds.map((id) => usersMap.get(id).id)
              : null,
            hideUserIds: rmsFieldSettings.hideUserIds
              ? rmsFieldSettings.hideUserIds.map((id) => usersMap.get(id).id)
              : null,
            importantStageIds: rmsFieldSettings.importantStageIds
              ? rmsFieldSettings.importantStageIds.map((id) => stagesMap.get(id))
              : null,
            requiredStageIds: rmsFieldSettings.requiredStageIds
              ? rmsFieldSettings.requiredStageIds.map((id) => stagesMap.get(id))
              : null,
            hideStageIds: rmsFieldSettings.hideStageIds
              ? rmsFieldSettings.hideStageIds.map((id) => stagesMap.get(id))
              : null,
          },
        });
      }
    }
  }
}
