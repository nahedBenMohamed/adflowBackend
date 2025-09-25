import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { CreateTaskSubtaskDto, TaskSubtaskDto, UpdateTaskSubtaskDto } from '../dto';

@Entity()
export class TaskSubtask {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  text: string;

  @Column()
  resolved: boolean;

  @Column()
  taskId: number;

  @Column()
  sortOrder: number;

  @Column()
  accountId: number;

  constructor(accountId: number, taskId: number, text: string, resolved: boolean, sortOrder: number) {
    this.accountId = accountId;
    this.text = text;
    this.resolved = resolved;
    this.taskId = taskId;
    this.sortOrder = sortOrder;
  }

  public static fromDto(accountId: number, taskId: number, dto: CreateTaskSubtaskDto): TaskSubtask {
    return new TaskSubtask(accountId, taskId, dto.text, dto.resolved, dto.sortOrder || 0);
  }

  public update(dto: UpdateTaskSubtaskDto): TaskSubtask {
    this.text = dto.text !== undefined ? dto.text : this.text;
    this.resolved = dto.resolved !== undefined ? dto.resolved : this.resolved;
    this.sortOrder = dto.sortOrder !== undefined ? dto.sortOrder : this.sortOrder;

    return this;
  }

  public toDto(): TaskSubtaskDto {
    return new TaskSubtaskDto(this);
  }
}
