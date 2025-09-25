import { ApiProperty } from '@nestjs/swagger';

export class FieldSettingsDto {
  @ApiProperty()
  fieldId: number;

  @ApiProperty({ nullable: true, type: [Number] })
  importantStageIds: number[] | null;

  @ApiProperty({ nullable: true, type: [Number] })
  requiredStageIds: number[] | null;

  @ApiProperty({ nullable: true, type: [Number] })
  excludeUserIds: number[] | null;

  @ApiProperty({ nullable: true, type: [Number] })
  readonlyUserIds: number[] | null;

  @ApiProperty({ nullable: true, type: [Number] })
  hideUserIds: number[] | null;

  @ApiProperty({ nullable: true, type: [Number] })
  hideStageIds: number[] | null;

  constructor({
    fieldId,
    importantStageIds,
    requiredStageIds,
    excludeUserIds,
    readonlyUserIds,
    hideUserIds,
    hideStageIds,
  }: FieldSettingsDto) {
    this.fieldId = fieldId;
    this.importantStageIds = importantStageIds;
    this.requiredStageIds = requiredStageIds;
    this.excludeUserIds = excludeUserIds;
    this.readonlyUserIds = readonlyUserIds;
    this.hideUserIds = hideUserIds;
    this.hideStageIds = hideStageIds;
  }
}
