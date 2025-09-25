import { Column, Entity, PrimaryColumn } from 'typeorm';
import { CreateDepartmentSettingsDto, UpdateDepartmentSettingsDto, DepartmentSettingsDto } from '../dto';

@Entity()
export class DepartmentSettings {
  @PrimaryColumn()
  departmentId: number;

  @Column()
  accountId: number;

  @Column({ type: 'simple-array', nullable: true })
  workingDays: string[] | null;

  @Column({ type: 'time', nullable: true })
  workingTimeFrom: string | null;

  @Column({ type: 'time', nullable: true })
  workingTimeTo: string | null;

  @Column({ nullable: true })
  timeZone: string | null;

  constructor(
    accountId: number,
    departmentId: number,
    workingDays: string[] | null,
    workingTimeFrom: string | null,
    workingTimeTo: string | null,
    timeZone: string | null,
  ) {
    this.accountId = accountId;
    this.departmentId = departmentId;
    this.workingDays = workingDays;
    this.workingTimeFrom = workingTimeFrom;
    this.workingTimeTo = workingTimeTo;
    this.timeZone = timeZone;
  }

  public static fromDto(
    accountId: number,
    departmentId: number,
    dto: CreateDepartmentSettingsDto | UpdateDepartmentSettingsDto,
  ): DepartmentSettings {
    return new DepartmentSettings(
      accountId,
      departmentId,
      dto?.workingDays ?? null,
      dto?.workingTimeFrom ?? null,
      dto?.workingTimeTo ?? null,
      dto?.timeZone ?? null,
    );
  }

  public update(dto: UpdateDepartmentSettingsDto): DepartmentSettings {
    this.workingDays = dto.workingDays !== undefined ? dto.workingDays : this.workingDays;
    this.workingTimeFrom = dto.workingTimeFrom !== undefined ? dto.workingTimeFrom : this.workingTimeFrom;
    this.workingTimeTo = dto.workingTimeTo !== undefined ? dto.workingTimeTo : this.workingTimeTo;
    this.timeZone = dto.timeZone !== undefined ? dto.timeZone : this.timeZone;

    return this;
  }

  public toDto(): DepartmentSettingsDto {
    return {
      departmentId: this.departmentId,
      workingDays: this.workingDays,
      workingTimeFrom: this.workingTimeFrom?.substring(0, 5) ?? null,
      workingTimeTo: this.workingTimeTo?.substring(0, 5) ?? null,
      timeZone: this.timeZone,
    };
  }
}
