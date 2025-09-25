import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { CreateSchedulePerformerDto, UpdateSchedulePerformerDto, SchedulePerformerDto } from '../dtos';
import { SchedulePerformerType } from '../enums';

@Entity()
export class SchedulePerformer {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  scheduleId: number;

  @Column()
  type: SchedulePerformerType;

  @Column({ nullable: true })
  userId: number | null;

  @Column({ nullable: true })
  departmentId: number | null;

  constructor(
    accountId: number,
    scheduleId: number,
    type: SchedulePerformerType,
    userId: number | null,
    departmentId: number | null,
  ) {
    this.accountId = accountId;
    this.scheduleId = scheduleId;
    this.type = type;
    this.userId = userId;
    this.departmentId = departmentId;
  }

  public static fromDto(accountId: number, scheduleId: number, dto: CreateSchedulePerformerDto): SchedulePerformer {
    return new SchedulePerformer(accountId, scheduleId, dto.type, dto.userId, dto.departmentId);
  }

  public update(dto: UpdateSchedulePerformerDto): SchedulePerformer {
    this.type = dto.type !== undefined ? dto.type : this.type;
    this.userId = dto.userId !== undefined ? dto.userId : this.userId;
    this.departmentId = dto.departmentId !== undefined ? dto.departmentId : this.departmentId;

    return this;
  }

  public toDto(): SchedulePerformerDto {
    return { id: this.id, type: this.type, userId: this.userId, departmentId: this.departmentId };
  }

  public equals(other: { type: SchedulePerformerType; userId?: number | null; departmentId?: number | null }): boolean {
    switch (other.type) {
      case SchedulePerformerType.Department:
        return this.departmentId === other.departmentId;
      case SchedulePerformerType.User:
        return this.userId === other.userId;
    }
  }
}
