import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

import { ScenarioType } from '../enums';

export class VoximplantScenarioNoteDto {
  @ApiProperty({ enum: ScenarioType })
  @IsEnum(ScenarioType)
  scenarioType: ScenarioType;

  @ApiProperty()
  @IsString()
  noteText: string;

  constructor(scenarioType: ScenarioType, noteText: string) {
    this.scenarioType = scenarioType;
    this.noteText = noteText;
  }
}
