import { ProjectEntitiesReportMetaDto } from '../dto';
import { type ProjectReportFieldMeta } from './project-report-field-meta';

export class ProjectEntitiesReportMeta {
  fields: ProjectReportFieldMeta[];

  constructor({ fields }: { fields: ProjectReportFieldMeta[] }) {
    this.fields = fields;
  }

  public toDto(): ProjectEntitiesReportMetaDto {
    return { fields: this.fields?.map((f) => f.toDto()) };
  }
}
