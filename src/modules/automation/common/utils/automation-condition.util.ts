import {
  BooleanFilter,
  DateFilter,
  ExistsFilter,
  ExistsFilterType,
  NumberFilter,
  SelectFilter,
  SimpleFilterType,
  StringFilter,
  StringFilterType,
} from '@/common';

import { AutomationEntityCondition, AutomationFieldCondition } from '../dto';

// const EntityFieldPrefix = 'entity.fields.f_';
const Names = {
  entity: 'entity',
  stage: () => `${Names.entity}.stageId`,
  owner: () => `${Names.entity}.responsibleUserId`,
  fields: () => `${Names.entity}.fields`,
  field: (fieldId: number) => `${Names.fields()}.f_${fieldId}`,
} as const;

export class AutomatonConditionUtil {
  public static formatEntityCondition(condition: AutomationEntityCondition): string {
    const conditions: string[] = [];
    if (condition.stageId) {
      conditions.push(`${Names.stage()} = ${condition.stageId}`);
    }

    if (condition.ownerIds?.length) {
      conditions.push(`${Names.owner()} in [${condition.ownerIds.join(',')}]`);
    }

    if (condition.fields?.length) {
      condition.fields.forEach((field) => {
        conditions.push(...AutomatonConditionUtil.formatFieldCondition(field));
      });
    }

    return conditions.length ? conditions.map((c) => `(${c})`).join(' and ') : 'true';
  }

  public static formatFieldCondition(field: AutomationFieldCondition): string[] {
    switch (field.type) {
      case SimpleFilterType.Boolean:
        return AutomatonConditionUtil.formatBooleanFieldCondition(field);
      case SimpleFilterType.Date:
        return AutomatonConditionUtil.formatDateFieldCondition(field);
      case SimpleFilterType.Number:
        return AutomatonConditionUtil.formatNumberFieldCondition(field);
      case SimpleFilterType.Select:
        return AutomatonConditionUtil.formatSelectFieldCondition(field);
      case SimpleFilterType.String:
        return AutomatonConditionUtil.formatStringFieldCondition(field);
      case SimpleFilterType.Exists:
        return AutomatonConditionUtil.formatExistsFieldCondition(field);
    }
  }

  private static formatBooleanFieldCondition(field: AutomationFieldCondition) {
    const conditions: string[] = [];
    const booleanFilter = field.filter as BooleanFilter;
    if (booleanFilter.value !== null && booleanFilter.value !== undefined) {
      if (booleanFilter.value) {
        conditions.push(`${Names.field(field.fieldId)} != null`);
        conditions.push(`${Names.field(field.fieldId)} = true`);
      } else {
        conditions.push(`(${Names.field(field.fieldId)} = null) or (${Names.field(field.fieldId)} = false)`);
      }
    }
    return conditions;
  }

  private static formatDateFieldCondition(field: AutomationFieldCondition) {
    const conditions: string[] = [];
    const dateFilter = field.filter as DateFilter;
    if (dateFilter.from || dateFilter.to) conditions.push(`${Names.field(field.fieldId)} != null`);
    if (dateFilter.from) conditions.push(`${Names.field(field.fieldId)} &gt;= "${dateFilter.from}"`);
    if (dateFilter.to) conditions.push(`${Names.field(field.fieldId)} &lt;= "${dateFilter.to}"`);
    return conditions;
  }

  private static formatNumberFieldCondition(field: AutomationFieldCondition) {
    const conditions: string[] = [];
    const numberFilter = field.filter as NumberFilter;
    if (
      (numberFilter.min !== null && numberFilter.min !== undefined) ||
      (numberFilter.max !== null && numberFilter.max !== undefined)
    ) {
      conditions.push(`${Names.field(field.fieldId)} != null`);
    }
    if (numberFilter.min !== null && numberFilter.min !== undefined) {
      conditions.push(`${Names.field(field.fieldId)} &gt;= ${numberFilter.min}`);
    }
    if (numberFilter.max !== null && numberFilter.max !== undefined) {
      conditions.push(`${Names.field(field.fieldId)} &lt;= ${numberFilter.max}`);
    }
    return conditions;
  }

  private static formatSelectFieldCondition(field: AutomationFieldCondition) {
    const conditions: string[] = [];
    const selectFilter = field.filter as SelectFilter;
    if (selectFilter.optionIds?.length) {
      conditions.push(`${Names.field(field.fieldId)} != null`);
      conditions.push(`some x in ${Names.field(field.fieldId)} satisfies x in [${selectFilter.optionIds.join(',')}]`);
    }
    return conditions;
  }

  private static formatStringFieldCondition(field: AutomationFieldCondition) {
    const conditions: string[] = [];
    const stringFilter = field.filter as StringFilter;
    switch (stringFilter.type) {
      case StringFilterType.Empty:
        conditions.push(`(${Names.field(field.fieldId)} = null) or (${Names.field(field.fieldId)} = "")`);
        break;
      case StringFilterType.NotEmpty:
        conditions.push(`${Names.field(field.fieldId)} != null`);
        conditions.push(`${Names.field(field.fieldId)} != ""`);
        break;
      case StringFilterType.Contains:
        if (stringFilter.text) {
          conditions.push(`${Names.field(field.fieldId)} != null`);
          conditions.push(`contains(${Names.field(field.fieldId)}, "${encodeURIComponent(stringFilter.text)}")`);
        }
        break;
    }
    return conditions;
  }

  private static formatExistsFieldCondition(field: AutomationFieldCondition) {
    const conditions: string[] = [];
    const existsFilter = field.filter as ExistsFilter;
    switch (existsFilter.type) {
      case ExistsFilterType.Empty:
        conditions.push(`(${Names.field(field.fieldId)} = null) or (${Names.field(field.fieldId)} = "")`);
        break;
      case ExistsFilterType.NotEmpty:
        conditions.push(`${Names.field(field.fieldId)} != null`);
        conditions.push(`${Names.field(field.fieldId)} != ""`);
        break;
    }
    return conditions;
  }
}
