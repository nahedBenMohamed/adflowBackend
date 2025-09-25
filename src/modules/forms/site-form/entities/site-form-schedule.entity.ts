import { Column, Entity, PrimaryColumn } from 'typeorm';

import { SiteFormScheduleDto } from '../dto';

@Entity()
export class SiteFormSchedule {
  @Column()
  accountId: number;

  @PrimaryColumn()
  formId: number;

  @PrimaryColumn()
  scheduleId: number;

  constructor(accountId: number, formId: number, scheduleId: number) {
    this.accountId = accountId;
    this.formId = formId;
    this.scheduleId = scheduleId;
  }

  public static fromDto(accountId: number, formId: number, dto: SiteFormScheduleDto): SiteFormSchedule {
    return new SiteFormSchedule(accountId, formId, dto.scheduleId);
  }

  public update(dto: SiteFormScheduleDto): SiteFormSchedule {
    this.scheduleId = dto.scheduleId !== undefined ? dto.scheduleId : this.scheduleId;

    return this;
  }

  public toDto(): SiteFormScheduleDto {
    return { scheduleId: this.scheduleId };
  }
}
