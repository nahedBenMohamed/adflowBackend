import { Column, Entity, PrimaryColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { UpdateUserProfileDto, UserProfileDto } from '../dto';

@Entity()
export class UserProfile {
  @Column()
  accountId: number;

  @PrimaryColumn()
  userId: number;

  @Column({ nullable: true, default: null })
  birthDate: Date | null;

  @Column({ nullable: true, default: null })
  employmentDate: Date | null;

  @Column({ type: 'time', nullable: true })
  workingTimeFrom: string | null;

  @Column({ type: 'time', nullable: true })
  workingTimeTo: string | null;

  constructor(
    accountId: number,
    userId: number,
    birthDate: Date | null,
    employmentDate: Date | null,
    workingTimeFrom: string | null,
    workingTimeTo: string | null,
  ) {
    this.accountId = accountId;
    this.userId = userId;
    this.birthDate = birthDate;
    this.employmentDate = employmentDate;
    this.workingTimeFrom = workingTimeFrom;
    this.workingTimeTo = workingTimeTo;
  }

  public update(dto: UpdateUserProfileDto): UserProfile {
    this.birthDate = dto.birthDate !== undefined ? DateUtil.fromISOString(dto.birthDate) : this.birthDate;
    this.employmentDate =
      dto.employmentDate !== undefined ? DateUtil.fromISOString(dto.employmentDate) : this.employmentDate;
    this.workingTimeFrom = dto.workingTimeFrom !== undefined ? dto.workingTimeFrom : this.workingTimeFrom;
    this.workingTimeTo = dto.workingTimeTo !== undefined ? dto.workingTimeTo : this.workingTimeTo;

    return this;
  }

  public toDto(): UserProfileDto {
    return {
      userId: this.userId,
      birthDate: this.birthDate?.toISOString() ?? null,
      employmentDate: this.employmentDate?.toISOString() ?? null,
      workingTimeFrom: this.workingTimeFrom?.substring(0, 5) ?? null,
      workingTimeTo: this.workingTimeTo?.substring(0, 5) ?? null,
    };
  }
}
