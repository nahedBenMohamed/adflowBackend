import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ScenarioType } from '../enums';
import { VoximplantScenarioNoteDto } from '../dto';

@Entity()
export class VoximplantScenarioNote {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  scenarioType: ScenarioType;

  @Column()
  noteText: string;

  constructor(accountId: number, scenarioType: ScenarioType, noteText: string) {
    this.accountId = accountId;
    this.scenarioType = scenarioType;
    this.noteText = noteText;
  }

  public static fromDto(accountId: number, dto: VoximplantScenarioNoteDto): VoximplantScenarioNote {
    return new VoximplantScenarioNote(accountId, dto.scenarioType, dto.noteText);
  }

  public toDto(): VoximplantScenarioNoteDto {
    return new VoximplantScenarioNoteDto(this.scenarioType, this.noteText);
  }
}
