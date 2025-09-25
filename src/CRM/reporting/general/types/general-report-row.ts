import { CallReportBlock } from '@/modules/telephony/voximplant/voximplant-reporting/types/call-report-block';

import { GeneralReportRowDto } from '../dto';
import { CrmGeneralReportEntity } from './crm-general-report-entity';
import { CrmGeneralReportField } from './crm-general-report-field';
import { CrmGeneralReportTask } from './crm-general-report-task';

export class GeneralReportRow {
  ownerId: number;
  entity: CrmGeneralReportEntity | null | undefined;
  task: CrmGeneralReportTask | null | undefined;
  activity: CrmGeneralReportTask | null | undefined;
  field: Map<number, CrmGeneralReportField> | null | undefined;
  call: CallReportBlock | null | undefined;

  constructor(
    ownerId: number,
    entity: CrmGeneralReportEntity | null | undefined,
    task: CrmGeneralReportTask | null | undefined,
    activity: CrmGeneralReportTask | null | undefined,
    field: Map<number, CrmGeneralReportField> | null | undefined,
    call: CallReportBlock | null | undefined,
  ) {
    this.ownerId = ownerId;
    this.entity = entity;
    this.task = task;
    this.activity = activity;
    this.field = field;
    this.call = call;
  }

  public toDto(): GeneralReportRowDto {
    return {
      ownerId: this.ownerId,
      entity: this.entity?.toDto(),
      task: this.task?.toDto(),
      activity: this.activity?.toDto(),
      fields: this.field ? Array.from(this.field.values()).map((v) => v.toDto()) : undefined,
      call: this.call?.toDto(),
    };
  }

  public add(row: GeneralReportRow): GeneralReportRow {
    if (this.entity && row.entity) {
      this.entity.add(row.entity);
    } else if (row.entity) {
      this.entity = row.entity;
    }

    if (this.task && row.task) {
      this.task.add(row.task);
    } else if (row.task) {
      this.task = row.task;
    }

    if (this.activity && row.activity) {
      this.activity.add(row.activity);
    } else if (row.activity) {
      this.activity = row.activity;
    }

    if (this.field && row.field) {
      for (const [rowFieldId, rowField] of row.field) {
        let field = this.field.get(rowFieldId);
        if (!field) {
          field = CrmGeneralReportField.empty(rowFieldId, rowField.fieldName);
          this.field.set(rowFieldId, field);
        }
        field.add(rowField);
      }
    } else if (row.field) {
      this.field = row.field;
    }

    if (this.call && row.call) {
      this.call.add(row.call);
    } else if (row.call) {
      this.call = row.call;
    }

    return this;
  }
}
