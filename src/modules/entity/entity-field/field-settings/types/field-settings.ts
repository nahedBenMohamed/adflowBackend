import { FieldSettingsDto } from '../dto';

export class FieldSettings {
  fieldId: number;
  importantStageIds: number[] | null;
  requiredStageIds: number[] | null;
  excludeUserIds: number[] | null;
  hideStageIds: number[] | null;
  readonlyUserIds: number[] | null;
  hideUserIds: number[] | null;

  constructor(
    fieldId: number,
    importantStageIds: number[] | null,
    requiredStageIds: number[] | null,
    excludeUserIds: number[] | null,
    hideStageIds: number[] | null,
    readonlyUserIds: number[] | null,
    hideUserIds: number[] | null,
  ) {
    this.fieldId = fieldId;
    this.importantStageIds = importantStageIds;
    this.requiredStageIds = requiredStageIds;
    this.excludeUserIds = excludeUserIds;
    this.hideStageIds = hideStageIds;
    this.readonlyUserIds = readonlyUserIds;
    this.hideUserIds = hideUserIds;
  }

  public toDto(): FieldSettingsDto {
    return new FieldSettingsDto({ ...this });
  }
}
