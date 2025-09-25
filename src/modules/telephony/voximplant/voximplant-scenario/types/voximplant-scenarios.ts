import { VoximplantScenariosDto } from '../dto';
import { VoximplantScenarioEntity, VoximplantScenarioNote, VoximplantScenarioTask } from '../entities';

export class VoximplantScenarios {
  entities: VoximplantScenarioEntity[] | null;
  notes: VoximplantScenarioNote[] | null;
  tasks: VoximplantScenarioTask[] | null;

  constructor(
    entities: VoximplantScenarioEntity[] | null,
    notes: VoximplantScenarioNote[] | null,
    tasks: VoximplantScenarioTask[] | null,
  ) {
    this.entities = entities;
    this.notes = notes;
    this.tasks = tasks;
  }

  public static fromDto(accountId: number, dto: VoximplantScenariosDto): VoximplantScenarios {
    return new VoximplantScenarios(
      dto.entities?.map((entity) => VoximplantScenarioEntity.fromDto(accountId, entity)) ?? null,
      dto.notes?.map((note) => VoximplantScenarioNote.fromDto(accountId, note)) ?? null,
      dto.tasks?.map((task) => VoximplantScenarioTask.fromDto(accountId, task)) ?? null,
    );
  }

  public toDto(): VoximplantScenariosDto {
    return new VoximplantScenariosDto(
      this.entities?.map((entity) => entity.toDto()) ?? [],
      this.notes?.map((note) => note.toDto()) ?? [],
      this.tasks?.map((task) => task.toDto()) ?? [],
    );
  }
}
