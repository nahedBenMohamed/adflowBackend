import { ProjectTaskUserReportRowDto } from '../dto';
import { type ProjectReportItem } from './project-report-item';
import { type ProjectStageItem } from './project-stage-item';

export class ProjectTaskUserReportRow {
  userId: number;
  opened: ProjectReportItem;
  done: ProjectReportItem;
  overdue: ProjectReportItem;
  stages: ProjectStageItem[];
  plannedTime: number;
  completionPercent: number;

  constructor(
    userId: number,
    opened: ProjectReportItem,
    done: ProjectReportItem,
    overdue: ProjectReportItem,
    stages: ProjectStageItem[],
    plannedTime: number,
    completionPercent: number,
  ) {
    this.userId = userId;
    this.opened = opened;
    this.done = done;
    this.overdue = overdue;
    this.stages = stages;
    this.plannedTime = plannedTime;
    this.completionPercent = completionPercent;
  }

  public toDto(): ProjectTaskUserReportRowDto {
    return {
      userId: this.userId,
      opened: this.opened.toDto(),
      done: this.done.toDto(),
      overdue: this.overdue.toDto(),
      stages: this.stages.map((s) => s.toDto()),
      planedTime: this.plannedTime,
      completionPercent: this.completionPercent,
    };
  }
}
