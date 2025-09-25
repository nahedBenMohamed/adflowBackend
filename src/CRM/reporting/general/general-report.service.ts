import { Injectable } from '@nestjs/common';

import { DatePeriod, ForbiddenError, intersection, propagateData } from '@/common';

import { AuthorizationService } from '@/modules/iam/authorization';
import { DepartmentService } from '@/modules/iam/department';
import { User } from '@/modules/iam/user/entities';
import { FieldType, FieldTypes } from '@/modules/entity/entity-field/common/enums/field-type.enum';
import { FieldService } from '@/modules/entity/entity-field/field/field.service';
import { TelephonyReportType } from '@/modules/telephony/voximplant/voximplant-reporting/enums';
import { CallReportRow } from '@/modules/telephony/voximplant/voximplant-reporting/types';
// eslint-disable-next-line max-len
import { VoximplantReportingService } from '@/modules/telephony/voximplant/voximplant-reporting/voximplant-reporting.service';

import { BoardStageService, GroupedStages } from '../../board-stage';
import { EntityType } from '../../entity-type';

import { OwnerDateValue, ReportRowOwner } from '../common';
import { CrmReportingService } from '../crm-reporting.service';

import { GeneralReportFilterDto } from './dto';
import {
  CrmGeneralReport,
  CrmGeneralReportField,
  CrmGeneralReportFieldMeta,
  CrmGeneralReportFieldOptionMeta,
  CrmGeneralReportFieldValue,
  CrmGeneralReportMeta,
  CrmGeneralReportRow,
  GeneralReport,
  GeneralReportRow,
} from './types';
import { GeneralReportType } from './enums';

interface VisibilityEntity {
  exclude?: boolean | null;
  excludeOpen?: boolean | null;
  excludeLost?: boolean | null;
  excludeWon?: boolean | null;
}
interface VisibilityTask {
  exclude?: boolean | null;
  excludeOpen?: boolean | null;
  excludeExpired?: boolean | null;
  excludeResolved?: boolean | null;
}
interface VisibilityFieldOption {
  optionId: number;
  exclude?: boolean | null;
}
interface VisibilityField {
  fieldId: number;
  exclude?: boolean | null;
  options?: VisibilityFieldOption[] | null;
}
interface VisibilityFields {
  exclude?: boolean | null;
  fields?: VisibilityField[] | null;
}
interface VisibilityCall {
  exclude?: boolean | null;
}
interface Visibility {
  entity?: VisibilityEntity | null;
  task?: VisibilityTask | null;
  activity?: VisibilityTask | null;
  fields?: VisibilityFields | null;
  call?: VisibilityCall | null;
}

interface Filter {
  include: { users: boolean; departments: boolean };
  stages: GroupedStages;
  period?: DatePeriod;
  userIds?: number[];
  visibility?: Visibility | null;
}

@Injectable()
export class GeneralReportService {
  constructor(
    private readonly authService: AuthorizationService,
    private readonly departmentService: DepartmentService,
    private readonly stageService: BoardStageService,
    private readonly reportingService: CrmReportingService,
    private readonly fieldService: FieldService,
    private readonly telephonyReporting: VoximplantReportingService,
  ) {}

  public async getGeneralReport({
    accountId,
    user,
    filter,
  }: {
    accountId: number;
    user: User;
    filter: GeneralReportFilterDto;
  }): Promise<GeneralReport> {
    const crmReport = await this.getCrmGeneralReport(accountId, user, filter);
    const callReport = !filter.visibility?.call?.exclude
      ? await this.telephonyReporting.getCallReport({
          accountId,
          user,
          filter: { ...filter, type: this.toTelephoneReportType(filter.type) },
        })
      : null;

    const users = this.combineGeneralReportRows(crmReport.users, callReport?.users);
    const departments = this.combineGeneralReportRows(crmReport.departments, callReport?.departments);

    const total = new GeneralReportRow(
      crmReport.total?.ownerId,
      crmReport.total?.entity,
      crmReport.total?.task,
      crmReport.total?.activity,
      crmReport.total?.field,
      callReport?.total?.call,
    );

    return new GeneralReport(users, departments, total, crmReport.meta);
  }

  private combineGeneralReportRows(
    crmRows: Map<number, CrmGeneralReportRow> | null | undefined,
    callRows: Map<number, CallReportRow> | null | undefined,
  ): Map<number, GeneralReportRow> {
    const rows: Map<number, GeneralReportRow> = new Map<number, GeneralReportRow>();
    if (crmRows) {
      for (const [key, crmRow] of crmRows) {
        const callRaw = callRows?.get(key);
        rows.set(
          key,
          new GeneralReportRow(key, crmRow.entity, crmRow.task, crmRow.activity, crmRow.field, callRaw?.call),
        );
      }
    }
    if (callRows) {
      for (const [key, callRaw] of callRows) {
        if (!rows.has(key)) {
          rows.set(key, new GeneralReportRow(key, null, null, null, null, callRaw?.call));
        }
      }
    }
    return rows;
  }
  private toTelephoneReportType(type: GeneralReportType): TelephonyReportType {
    switch (type) {
      case GeneralReportType.Department:
        return TelephonyReportType.Department;
      case GeneralReportType.Rating:
        return TelephonyReportType.Rating;
      case GeneralReportType.User:
        return TelephonyReportType.User;
    }
  }

  private async getCrmGeneralReport(
    accountId: number,
    user: User,
    filter: GeneralReportFilterDto,
  ): Promise<CrmGeneralReport> {
    const { allow, userIds } = await this.authService.getPermissions({
      action: 'report',
      user,
      authorizable: EntityType.getAuthorizable(filter.entityTypeId),
    });
    if (!allow) {
      throw new ForbiddenError();
    }

    const stages = await this.stageService.getGroupedByType({
      accountId,
      entityTypeId: filter.entityTypeId,
      boardId: filter.boardIds?.length ? filter.boardIds : undefined,
      type: filter.stageType,
    });
    const include = {
      users: filter.type !== GeneralReportType.Department,
      departments: filter.type !== GeneralReportType.Rating,
    };

    const report = await this.getReport(
      accountId,
      filter.entityTypeId,
      {
        include,
        stages,
        period: filter.period ? DatePeriod.fromFilter(filter.period) : undefined,
        userIds: filter.userIds?.length ? intersection(filter.userIds, userIds) : userIds,
        visibility: filter.visibility,
      },
      filter.ownerFieldId,
      filter.type === GeneralReportType.Rating,
    );

    if (report.departments.size) {
      const useWon = stages.won?.length > 0;
      const hierarchy = await this.departmentService.getHierarchy({ accountId });

      if (hierarchy.length) {
        propagateData(hierarchy, report.departments, (ownerId: number) => {
          return CrmGeneralReport.createEmptyRow(ownerId, useWon);
        });
      }
    }

    return report;
  }

  private async getReport(
    accountId: number,
    entityTypeId: number,
    filter: Filter,
    ownerFieldId: number | undefined,
    sort: boolean,
  ): Promise<CrmGeneralReport> {
    const useWon = filter.stages.won?.length > 0;
    const [meta, users, departments, total] = await Promise.all([
      this.getReportMeta(accountId, entityTypeId),
      filter.include.users
        ? this.getReportGroupBy(accountId, entityTypeId, 'user', ownerFieldId, useWon, sort, filter)
        : Promise.resolve(new Map<number, CrmGeneralReportRow>()),
      filter.include.departments
        ? await this.getReportGroupBy(accountId, entityTypeId, 'department', ownerFieldId, useWon, sort, filter)
        : Promise.resolve(new Map<number, CrmGeneralReportRow>()),
      this.getReportGroupBy(accountId, entityTypeId, 'total', ownerFieldId, useWon, false, filter),
    ]);

    return new CrmGeneralReport(users, departments, total.values().next().value, meta);
  }

  private async getReportMeta(accountId: number, entityTypeId: number): Promise<CrmGeneralReportMeta> {
    const fieldsMeta: CrmGeneralReportFieldMeta[] = (
      await Promise.all([
        this.getSelectFieldsMeta({ accountId, entityTypeId }),
        this.getSwitchFieldsMeta({ accountId, entityTypeId }),
        this.getFormulaFieldsMeta({ accountId, entityTypeId }),
      ])
    ).flat();
    return new CrmGeneralReportMeta(fieldsMeta);
  }
  private async getSelectFieldsMeta({
    accountId,
    entityTypeId,
  }: {
    accountId: number;
    entityTypeId: number;
  }): Promise<CrmGeneralReportFieldMeta[]> {
    const fields = await this.fieldService.findMany(
      {
        accountId,
        entityTypeId,
        type: [...FieldTypes.select, ...FieldTypes.multiSelect],
      },
      { expand: ['options'] },
    );
    return fields.map(
      (field) =>
        new CrmGeneralReportFieldMeta(
          field.id,
          field.name,
          field.options.map((o) => new CrmGeneralReportFieldOptionMeta(o.id, o.label, field.format)),
        ),
    );
  }
  private async getSwitchFieldsMeta({
    accountId,
    entityTypeId,
  }: {
    accountId: number;
    entityTypeId: number;
  }): Promise<CrmGeneralReportFieldMeta[]> {
    const fields = await this.fieldService.findMany({ accountId, entityTypeId, type: FieldType.Switch });
    return fields.map(
      (field) =>
        new CrmGeneralReportFieldMeta(field.id, field.name, [
          new CrmGeneralReportFieldOptionMeta(0, false, field.format),
          new CrmGeneralReportFieldOptionMeta(1, true, field.format),
        ]),
    );
  }
  private async getFormulaFieldsMeta({
    accountId,
    entityTypeId,
  }: {
    accountId: number;
    entityTypeId: number;
  }): Promise<CrmGeneralReportFieldMeta[]> {
    const fields = await this.fieldService.findMany({
      accountId,
      entityTypeId,
      type: [FieldType.Formula, FieldType.Number],
    });
    return fields.map(
      (field) =>
        new CrmGeneralReportFieldMeta(field.id, field.name, [new CrmGeneralReportFieldOptionMeta(0, '', field.format)]),
    );
  }

  private async getReportGroupBy(
    accountId: number,
    entityTypeId: number,
    owner: ReportRowOwner,
    ownerFieldId: number | undefined,
    useWon: boolean,
    sort: boolean,
    filter: Filter,
  ): Promise<Map<number, CrmGeneralReportRow>> {
    const rowMap = new Map<number, CrmGeneralReportRow>();

    if (!filter.visibility?.entity?.exclude)
      await this.processEntities(accountId, owner, ownerFieldId, useWon, filter, rowMap);
    if (!filter.visibility?.task?.exclude)
      await this.processTasks(accountId, filter.stages.all, useWon, owner, filter, rowMap);
    if (!filter.visibility?.activity?.exclude)
      await this.processActivities(accountId, filter.stages.all, useWon, owner, filter, rowMap);

    if (!filter.visibility?.fields?.exclude) {
      const excludeFields = filter.visibility?.fields?.fields?.filter((f) => f.exclude).map((f) => f.fieldId);
      await this.processSelectField(
        accountId,
        entityTypeId,
        owner,
        ownerFieldId,
        useWon,
        filter,
        excludeFields,
        rowMap,
      );
      await this.processMultiSelectField(
        accountId,
        entityTypeId,
        owner,
        ownerFieldId,
        useWon,
        filter,
        excludeFields,
        rowMap,
      );
      await this.processSwitchField(
        accountId,
        entityTypeId,
        owner,
        ownerFieldId,
        useWon,
        filter,
        excludeFields,
        rowMap,
      );
      await this.processNumberField(
        accountId,
        entityTypeId,
        owner,
        ownerFieldId,
        useWon,
        filter,
        excludeFields,
        rowMap,
      );
    }

    if (sort) {
      const rows = Array.from(rowMap.values());

      const sorted = rows.sort((rowA, rowB) =>
        useWon ? rowB.entity.won.amount - rowA.entity.won.amount : rowB.entity.all.amount - rowA.entity.all.amount,
      );

      return new Map(sorted.map((row) => [row.ownerId, row]));
    }

    return rowMap;
  }

  private async processEntities(
    accountId: number,
    owner: ReportRowOwner,
    userOwnerFieldId: number | undefined,
    useWon: boolean,
    filter: Filter,
    rowMap: Map<number, CrmGeneralReportRow>,
  ) {
    const [open, lost, won] = await Promise.all([
      filter.stages.open?.length && !filter.visibility?.entity?.excludeOpen
        ? this.reportingService.getEntityGroupBy(
            accountId,
            filter.stages.open,
            { owner, userOwnerFieldId },
            { amount: true, quantity: true },
            { createdAt: filter.period, userIds: filter.userIds },
          )
        : Promise.resolve({ quantity: [], amount: [] }),
      filter.stages.lost?.length && !filter.visibility?.entity?.excludeLost
        ? this.reportingService.getEntityGroupBy(
            accountId,
            filter.stages.lost,
            { owner, userOwnerFieldId },
            { amount: true, quantity: true, close: !useWon },
            { closedAt: filter.period, userIds: filter.userIds },
          )
        : Promise.resolve({ quantity: [], amount: [], close: [] }),
      filter.stages.won?.length && !filter.visibility?.entity?.excludeWon
        ? this.reportingService.getEntityGroupBy(
            accountId,
            filter.stages.won,
            { owner, userOwnerFieldId },
            { amount: true, quantity: true, close: true },
            { closedAt: filter.period, userIds: filter.userIds },
          )
        : Promise.resolve({ quantity: [], amount: [], close: [] }),
    ]);
    for (const { ownerId, value } of open.quantity) {
      const values = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
      values.entity.all.quantity += value;
      values.entity.open.quantity = value;
      rowMap.set(ownerId, values);
    }
    for (const { ownerId, value } of open.amount) {
      const values = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
      values.entity.all.amount += value;
      values.entity.open.amount = value;
      rowMap.set(ownerId, values);
    }
    for (const { ownerId, value } of lost.quantity) {
      const values = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
      values.entity.all.quantity += value;
      values.entity.lost.quantity = value;
      rowMap.set(ownerId, values);
    }
    for (const { ownerId, value } of lost.amount) {
      const values = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
      values.entity.all.amount += value;
      values.entity.lost.amount = value;
      rowMap.set(ownerId, values);
    }
    for (const { ownerId, value } of lost.close) {
      const values = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
      values.entity.close = value;
      rowMap.set(ownerId, values);
    }
    for (const { ownerId, value } of won.quantity) {
      const values = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
      values.entity.all.quantity += value;
      values.entity.won.quantity = value;
      rowMap.set(ownerId, values);
    }
    for (const { ownerId, value } of won.amount) {
      const values = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
      values.entity.all.amount += value;
      values.entity.won.amount = value;
      rowMap.set(ownerId, values);
    }
    for (const { ownerId, value } of won.close) {
      const values = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
      values.entity.close = value;
      rowMap.set(ownerId, values);
    }
  }
  private async processTasks(
    accountId: number,
    stageIds: number[],
    useWon: boolean,
    owner: ReportRowOwner,
    filter: Filter,
    rowMap: Map<number, CrmGeneralReportRow>,
  ) {
    const [open, expired, resolved] = await this.getTasksOrActivity(accountId, 'task', stageIds, owner, filter);

    for (const { ownerId, value } of open) {
      const values = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
      values.task.all += value;
      values.task.open = value;
      rowMap.set(ownerId, values);
    }
    for (const { ownerId, value } of expired) {
      const values = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
      values.task.expired = value;
      rowMap.set(ownerId, values);
    }
    for (const { ownerId, value } of resolved) {
      const values = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
      values.task.all += value;
      values.task.resolved = value;
      rowMap.set(ownerId, values);
    }
  }
  private async processActivities(
    accountId: number,
    stageIds: number[],
    useWon: boolean,
    owner: ReportRowOwner,
    filter: Filter,
    rowMap: Map<number, CrmGeneralReportRow>,
  ) {
    const [open, expired, resolved] = await this.getTasksOrActivity(accountId, 'activity', stageIds, owner, filter);

    for (const { ownerId, value } of open) {
      const values = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
      values.activity.all += value;
      values.activity.open = value;
      rowMap.set(ownerId, values);
    }
    for (const { ownerId, value } of expired) {
      const values = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
      values.activity.expired = value;
      rowMap.set(ownerId, values);
    }
    for (const { ownerId, value } of resolved) {
      const values = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
      values.activity.all += value;
      values.activity.resolved = value;
      rowMap.set(ownerId, values);
    }
  }
  private async getTasksOrActivity(
    accountId: number,
    source: 'task' | 'activity',
    stageIds: number[],
    owner: ReportRowOwner,
    filter: Filter,
  ): Promise<[OwnerDateValue[], OwnerDateValue[], OwnerDateValue[]]> {
    return Promise.all([
      !filter.visibility?.task?.excludeOpen
        ? this.reportingService.getTaskOrActivityGroupBy(
            accountId,
            source,
            stageIds,
            { owner },
            { resolved: false, period: filter.period, dateField: 'created_at', ownerIds: filter.userIds },
          )
        : Promise.resolve([] as OwnerDateValue[]),
      !filter.visibility?.task?.excludeExpired
        ? this.reportingService.getTaskOrActivityGroupBy(
            accountId,
            source,
            stageIds,
            { owner },
            {
              expired: true,
              resolved: false,
              period: filter.period,
              dateField: 'created_at',
              ownerIds: filter.userIds,
            },
          )
        : Promise.resolve([] as OwnerDateValue[]),
      !filter.visibility?.task?.excludeResolved
        ? this.reportingService.getTaskOrActivityGroupBy(
            accountId,
            source,
            stageIds,
            { owner },
            { resolved: true, period: filter.period, dateField: 'created_at', ownerIds: filter.userIds },
          )
        : Promise.resolve([] as OwnerDateValue[]),
    ]);
  }
  private async processSelectField(
    accountId: number,
    entityTypeId: number,
    owner: ReportRowOwner,
    userOwnerFieldId: number | undefined,
    useWon: boolean,
    filter: Filter,
    excludeFieldIds: number[] | null | undefined,
    rowMap: Map<number, CrmGeneralReportRow>,
  ) {
    const fields = await this.fieldService.findMany(
      {
        accountId,
        entityTypeId,
        type: FieldTypes.select,
        excludeId: excludeFieldIds,
      },
      { expand: ['options'] },
    );
    const results = await Promise.all(
      fields
        .map((field) => {
          // const excludeIds = filter.visibility?.fields?.fields
          //   ?.find((f) => f.fieldId === field.id)
          //   ?.options?.filter((o) => o.exclude)
          //   .map((o) => o.optionId);
          // eslint-disable-next-line max-len
          // const options = excludeIds?.length ? field.options.filter((o) => !excludeIds.includes(o.id)) : field.options;
          const options = field.options;
          return options.map(async (option) => ({
            fieldId: field.id,
            fieldName: field.name,
            optionId: option.id,
            optionLabel: option.label,
            result: await this.reportingService.getEntityGroupBy(
              accountId,
              filter.stages.all,
              { owner, userOwnerFieldId },
              { amount: true, quantity: true },
              { createdAt: filter.period, userIds: filter.userIds, field: { fieldId: field.id, optionId: option.id } },
            ),
          }));
        })
        .flat(),
    );
    for (const { fieldId, fieldName, optionId, optionLabel, result } of results) {
      for (const { ownerId, value } of result.quantity) {
        const grUser = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
        const grField = grUser.field.get(fieldId) ?? CrmGeneralReportField.empty(fieldId, fieldName);
        const grFieldValues = grField.values.get(optionId) ?? CrmGeneralReportFieldValue.empty(optionId, optionLabel);
        grFieldValues.quantity = value;
        grField.values.set(optionId, grFieldValues);
        grUser.field.set(fieldId, grField);
        rowMap.set(ownerId, grUser);
      }
      for (const { ownerId, value } of result.amount) {
        const grUser = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
        const grField = grUser.field.get(fieldId) ?? CrmGeneralReportField.empty(fieldId, fieldName);
        const grFieldValues = grField.values.get(optionId) ?? CrmGeneralReportFieldValue.empty(optionId, optionLabel);
        grFieldValues.amount = value;
        grField.values.set(optionId, grFieldValues);
        grUser.field.set(fieldId, grField);
        rowMap.set(ownerId, grUser);
      }
    }
  }
  private async processMultiSelectField(
    accountId: number,
    entityTypeId: number,
    owner: ReportRowOwner,
    userOwnerFieldId: number | undefined,
    useWon: boolean,
    filter: Filter,
    excludeFieldIds: number[] | null | undefined,
    rowMap: Map<number, CrmGeneralReportRow>,
  ) {
    const fields = await this.fieldService.findMany(
      {
        accountId,
        entityTypeId,
        type: FieldTypes.multiSelect,
        excludeId: excludeFieldIds,
      },
      { expand: ['options'] },
    );
    const results = await Promise.all(
      fields
        .map((field) => {
          // const excludeIds = filter.visibility?.fields?.fields
          //   ?.find((f) => f.fieldId === field.id)
          //   ?.options?.filter((o) => o.exclude)
          //   .map((o) => o.optionId);
          // eslint-disable-next-line max-len
          // const options = excludeIds?.length ? field.options.filter((o) => !excludeIds.includes(o.id)) : field.options;
          const options = field.options;
          return options.map(async (option) => ({
            fieldId: field.id,
            fieldName: field.name,
            optionId: option.id,
            optionLabel: option.label,
            result: await this.reportingService.getEntityGroupBy(
              accountId,
              filter.stages.all,
              { owner, userOwnerFieldId },
              { amount: true, quantity: true },
              {
                createdAt: filter.period,
                userIds: filter.userIds,
                field: { fieldId: field.id, optionsId: option.id },
              },
            ),
          }));
        })
        .flat(),
    );
    for (const { fieldId, fieldName, optionId, optionLabel, result } of results) {
      for (const { ownerId, value } of result.quantity) {
        const grUser = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
        const grField = grUser.field.get(fieldId) ?? CrmGeneralReportField.empty(fieldId, fieldName);
        const grFieldValues = grField.values.get(optionId) ?? CrmGeneralReportFieldValue.empty(optionId, optionLabel);
        grFieldValues.quantity = value;
        grField.values.set(optionId, grFieldValues);
        grUser.field.set(fieldId, grField);
        rowMap.set(ownerId, grUser);
      }
      for (const { ownerId, value } of result.amount) {
        const grUser = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
        const grField = grUser.field.get(fieldId) ?? CrmGeneralReportField.empty(fieldId, fieldName);
        const grFieldValues = grField.values.get(optionId) ?? CrmGeneralReportFieldValue.empty(optionId, optionLabel);
        grFieldValues.amount = value;
        grField.values.set(optionId, grFieldValues);
        grUser.field.set(fieldId, grField);
        rowMap.set(ownerId, grUser);
      }
    }
  }
  private async processSwitchField(
    accountId: number,
    entityTypeId: number,
    owner: ReportRowOwner,
    userOwnerFieldId: number | undefined,
    useWon: boolean,
    filter: Filter,
    excludeFieldIds: number[] | null | undefined,
    rowMap: Map<number, CrmGeneralReportRow>,
  ) {
    const fields = await this.fieldService.findMany({
      accountId,
      entityTypeId,
      type: FieldType.Switch,
      excludeId: excludeFieldIds,
    });
    const results = (
      await Promise.all(
        fields.map(async (field) => [
          {
            fieldId: field.id,
            fieldName: field.name,
            optionId: 1,
            optionLabel: true,
            result: await this.reportingService.getEntityGroupBy(
              accountId,
              filter.stages.all,
              { owner, userOwnerFieldId },
              { amount: true, quantity: true },
              {
                createdAt: filter.period,
                userIds: filter.userIds,
                field: { fieldId: field.id, switch: true },
              },
            ),
          },
          {
            fieldId: field.id,
            fieldName: field.name,
            optionId: 0,
            optionLabel: false,
            result: await this.reportingService.getEntityGroupBy(
              accountId,
              filter.stages.all,
              { owner, userOwnerFieldId },
              { amount: true, quantity: true },
              {
                createdAt: filter.period,
                userIds: filter.userIds,
                field: { fieldId: field.id, switch: false },
              },
            ),
          },
        ]),
      )
    ).flat();
    for (const { fieldId, fieldName, optionId, optionLabel, result } of results) {
      for (const { ownerId, value } of result.quantity) {
        const grUser = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
        const grField = grUser.field.get(fieldId) ?? CrmGeneralReportField.empty(fieldId, fieldName);
        const grFieldValues = grField.values.get(optionId) ?? CrmGeneralReportFieldValue.empty(optionId, optionLabel);
        grFieldValues.quantity = value;
        grField.values.set(optionId, grFieldValues);
        grUser.field.set(fieldId, grField);
        rowMap.set(ownerId, grUser);
      }
      for (const { ownerId, value } of result.amount) {
        const grUser = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
        const grField = grUser.field.get(fieldId) ?? CrmGeneralReportField.empty(fieldId, fieldName);
        const grFieldValues = grField.values.get(optionId) ?? CrmGeneralReportFieldValue.empty(optionId, optionLabel);
        grFieldValues.amount = value;
        grField.values.set(optionId, grFieldValues);
        grUser.field.set(fieldId, grField);
        rowMap.set(ownerId, grUser);
      }
    }
  }
  private async processNumberField(
    accountId: number,
    entityTypeId: number,
    owner: ReportRowOwner,
    userOwnerFieldId: number | undefined,
    useWon: boolean,
    filter: Filter,
    excludeFieldIds: number[] | null | undefined,
    rowMap: Map<number, CrmGeneralReportRow>,
  ) {
    const fields = await this.fieldService.findMany({
      accountId,
      entityTypeId,
      type: [FieldType.Number, FieldType.Formula],
      excludeId: excludeFieldIds,
    });
    const results = (
      await Promise.all(
        fields.map(async (field) => ({
          fieldId: field.id,
          fieldName: field.name,
          result: await this.reportingService.getEntityGroupBy(
            accountId,
            filter.stages.all,
            { owner, userOwnerFieldId },
            { fieldAmount: field.id, fieldQuantity: field.id },
            { createdAt: filter.period, userIds: filter.userIds },
          ),
        })),
      )
    ).flat();
    for (const { fieldId, fieldName, result } of results) {
      for (const { ownerId, value } of result.fieldQuantity) {
        const grUser = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
        const grField = grUser.field.get(fieldId) ?? CrmGeneralReportField.empty(fieldId, fieldName);
        const grFieldValues = grField.values.get(0) ?? CrmGeneralReportFieldValue.empty(0, '');
        grFieldValues.quantity = value;
        grField.values.set(0, grFieldValues);
        grUser.field.set(fieldId, grField);
        rowMap.set(ownerId, grUser);
      }
      for (const { ownerId, value } of result.fieldAmount) {
        const grUser = rowMap.get(ownerId) ?? CrmGeneralReportRow.empty(ownerId, useWon);
        const grField = grUser.field.get(fieldId) ?? CrmGeneralReportField.empty(fieldId, fieldName);
        const grFieldValues = grField.values.get(0) ?? CrmGeneralReportFieldValue.empty(0, '');
        grFieldValues.amount = value;
        grField.values.set(0, grFieldValues);
        grUser.field.set(fieldId, grField);
        rowMap.set(ownerId, grUser);
      }
    }
  }
}
