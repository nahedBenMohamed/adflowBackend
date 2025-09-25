import { ProjectStageItemDto } from '../dto';
import { type ProjectReportItem } from './project-report-item';

export class ProjectStageItem {
  stageId: number;
  item: ProjectReportItem;

  constructor(stageId: number, item: ProjectReportItem) {
    this.stageId = stageId;
    this.item = item;
  }

  public toDto(): ProjectStageItemDto {
    return { stageId: this.stageId, item: this.item.toDto() };
  }
}
