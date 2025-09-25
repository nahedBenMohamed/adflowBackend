import { CrmGeneralReportTaskDto } from '../dto/crm-general-report-task.dto';

export class CrmGeneralReportTask {
  all: number;
  open: number;
  expired: number;
  resolved: number;

  constructor(all: number, open: number, expired: number, resolved: number) {
    this.all = all;
    this.open = open;
    this.expired = expired;
    this.resolved = resolved;
  }

  public static empty(): CrmGeneralReportTask {
    return new CrmGeneralReportTask(0, 0, 0, 0);
  }

  public toDto(): CrmGeneralReportTaskDto {
    return new CrmGeneralReportTaskDto(this.all, this.open, this.expired, this.resolved);
  }

  public add(task: CrmGeneralReportTask) {
    this.all += task.all;
    this.open += task.open;
    this.expired += task.expired;
    this.resolved += task.resolved;
  }
}
