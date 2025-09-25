import { ProjectReportItemDto } from '../dto';

export class ProjectReportItem {
  taskCount: number;
  plannedTime: number | null;

  constructor(taskCount: number, plannedTime: number | null) {
    this.taskCount = taskCount;
    this.plannedTime = plannedTime;
  }

  public static empty(): ProjectReportItem {
    return new ProjectReportItem(0, 0);
  }

  public toDto(): ProjectReportItemDto {
    return { taskCount: this.taskCount, plannedTime: this.plannedTime };
  }
}
