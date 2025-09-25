import { ProjectEntitiesReportRowDto } from '../dto';
import { type ProjectReportField } from './project-report-field';
import { type ProjectReportItem } from './project-report-item';
import { type ProjectStageItem } from './project-stage-item';

export class ProjectEntitiesReportRow {
  entityId: number;
  entityName: string;
  all: ProjectReportItem;
  done: ProjectReportItem;
  overdue: ProjectReportItem;
  stages: ProjectStageItem[];
  projectStageId: number | null;
  completionPercent: number;
  fields: ProjectReportField[];

  constructor(
    entityId: number,
    entityName: string,
    all: ProjectReportItem,
    done: ProjectReportItem,
    overdue: ProjectReportItem,
    stages: ProjectStageItem[],
    projectStageId: number | null,
    completionPercent: number,
    fields: ProjectReportField[],
  ) {
    this.entityId = entityId;
    this.entityName = entityName;
    this.all = all;
    this.done = done;
    this.overdue = overdue;
    this.stages = stages;
    this.projectStageId = projectStageId;
    this.completionPercent = completionPercent;
    this.fields = fields;
  }

  public toDto(): ProjectEntitiesReportRowDto {
    return {
      entityId: this.entityId,
      entityName: this.entityName,
      all: this.all.toDto(),
      done: this.done.toDto(),
      overdue: this.overdue.toDto(),
      stages: this.stages.map((stage) => stage.toDto()),
      projectStageId: this.projectStageId,
      completionPercent: this.completionPercent,
      fields: this.fields?.map((field) => field.toDto()),
    };
  }
}
