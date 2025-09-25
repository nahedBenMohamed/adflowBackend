import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

import { VoximplantScenarioEntityDto } from './voximplant-scenario-entity.dto';
import { VoximplantScenarioNoteDto } from './voximplant-scenario-note.dto';
import { VoximplantScenarioTaskDto } from './voximplant-scenario-task.dto';

export class VoximplantScenariosDto {
  @ApiProperty({ type: [VoximplantScenarioEntityDto], nullable: true })
  @IsOptional()
  @IsArray()
  entities: VoximplantScenarioEntityDto[] | null;

  @ApiProperty({ type: [VoximplantScenarioNoteDto], nullable: true })
  @IsOptional()
  @IsArray()
  notes: VoximplantScenarioNoteDto[] | null;

  @ApiProperty({ type: [VoximplantScenarioTaskDto], nullable: true })
  @IsOptional()
  @IsArray()
  tasks: VoximplantScenarioTaskDto[] | null;

  constructor(
    entities: VoximplantScenarioEntityDto[] | null,
    notes: VoximplantScenarioNoteDto[] | null,
    tasks: VoximplantScenarioTaskDto[] | null,
  ) {
    this.entities = entities;
    this.notes = notes;
    this.tasks = tasks;
  }
}
