import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { TaskFieldCode } from '../enums/task-field-code.enum';
import { TaskSettingsType } from '../enums/task-settings-type.enum';
import { CreateTaskSettingsDto } from '../dto/create-task-settings.dto';
import { TaskSettingsDto } from '../dto/task-settings.dto';

@Entity()
export class TaskSettings {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column({ type: 'jsonb' })
  activeFields: TaskFieldCode[];

  @Column()
  type: TaskSettingsType;

  @Column({ nullable: true })
  recordId: number | null;

  constructor(accountId: number, type: TaskSettingsType, recordId: number | null, activeFields: TaskFieldCode[]) {
    this.accountId = accountId;
    this.type = type;
    this.recordId = recordId;
    this.activeFields = activeFields;
  }

  public static fromDto(accountId: number, dto: CreateTaskSettingsDto) {
    return new TaskSettings(accountId, dto.type, dto.recordId, dto.activeFields);
  }

  public toDto(): TaskSettingsDto {
    return { id: this.id, type: this.type, recordId: this.recordId, activeFields: this.activeFields };
  }
}
