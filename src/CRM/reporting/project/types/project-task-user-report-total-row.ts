import { ProjectTaskUserReportTotalRowDto } from '../dto';
import { ProjectReportItem } from './project-report-item';
import { type ProjectStageItem } from './project-stage-item';

export class ProjectTaskUserReportTotalRow {
  opened: ProjectReportItem;
  done: ProjectReportItem;
  overdue: ProjectReportItem;
  stages: ProjectStageItem[];
  plannedTime: number;
  completionPercent: number;

  constructor(
    opened: ProjectReportItem,
    done: ProjectReportItem,
    overdue: ProjectReportItem,
    stages: ProjectStageItem[],
    plannedTime: number,
    completionPercent: number,
  ) {
    this.opened = opened;
    this.done = done;
    this.overdue = overdue;
    this.stages = stages;
    this.plannedTime = plannedTime;
    this.completionPercent = completionPercent;
  }

  public static empty(): ProjectTaskUserReportTotalRow {
    return new ProjectTaskUserReportTotalRow(
      ProjectReportItem.empty(),
      ProjectReportItem.empty(),
      ProjectReportItem.empty(),
      [],
      0,
      0,
    );
  }

  public toDto(): ProjectTaskUserReportTotalRowDto {
    return {
      opened: this.opened.toDto(),
      done: this.done.toDto(),
      overdue: this.overdue.toDto(),
      stages: this.stages.map((s) => s.toDto()),
      planedTime: this.plannedTime,
      completionPercent: this.completionPercent,
    };
  }
}
