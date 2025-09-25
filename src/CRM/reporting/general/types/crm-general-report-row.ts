import { CrmGeneralReportRowDto } from '../dto';

import { CrmGeneralReportEntity } from './crm-general-report-entity';
import { CrmGeneralReportField } from './crm-general-report-field';
import { CrmGeneralReportTask } from './crm-general-report-task';

export class CrmGeneralReportRow {
  ownerId: number;
  entity: CrmGeneralReportEntity;
  task: CrmGeneralReportTask;
  activity: CrmGeneralReportTask;
  field: Map<number, CrmGeneralReportField>;

  constructor(
    ownerId: number,
    entity: CrmGeneralReportEntity,
    task: CrmGeneralReportTask,
    activity: CrmGeneralReportTask,
    field: Map<number, CrmGeneralReportField>,
  ) {
    this.ownerId = ownerId;
    this.entity = entity;
    this.task = task;
    this.activity = activity;
    this.field = field;
  }

  public static empty(ownerId: number, useWon: boolean): CrmGeneralReportRow {
    return new CrmGeneralReportRow(
      ownerId,
      CrmGeneralReportEntity.empty(useWon),
      CrmGeneralReportTask.empty(),
      CrmGeneralReportTask.empty(),
      new Map<number, CrmGeneralReportField>(),
    );
  }

  public toDto(): CrmGeneralReportRowDto {
    return new CrmGeneralReportRowDto(
      this.ownerId,
      this.entity.toDto(),
      this.task.toDto(),
      this.activity.toDto(),
      Array.from(this.field.values()).map((v) => v.toDto()),
    );
  }

  public add(row: CrmGeneralReportRow): CrmGeneralReportRow {
    this.entity.add(row.entity);

    this.task.add(row.task);
    this.activity.add(row.activity);

    for (const [rowFieldId, rowField] of row.field) {
      let field = this.field.get(rowFieldId);
      if (!field) {
        field = CrmGeneralReportField.empty(rowFieldId, rowField.fieldName);
        this.field.set(rowFieldId, field);
      }
      field.add(rowField);
    }

    return this;
  }
}
