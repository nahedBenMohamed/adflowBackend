import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { RentalIntervalType } from './rental-interval-type.enum';
import { RentalIntervalDto } from '../dto/rental-interval.dto';

@Entity()
export class RentalInterval {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  sectionId: number;

  @Column()
  type: RentalIntervalType;

  @Column({ type: 'time', nullable: true })
  startTime: string | null;

  @Column()
  accountId: number;

  constructor(accountId: number, sectionId: number, type: RentalIntervalType, startTime: string | null) {
    this.accountId = accountId;
    this.sectionId = sectionId;
    this.type = type;
    this.startTime = startTime;
  }

  public static create(accountId: number, sectionId: number, dto: RentalIntervalDto): RentalInterval {
    return new RentalInterval(accountId, sectionId, dto.type, dto.startTime);
  }

  public update(dto: RentalIntervalDto): RentalInterval {
    this.type = dto.type ?? this.type;
    this.startTime = dto.startTime ?? this.startTime;

    return this;
  }

  public toDto(): RentalIntervalDto {
    return new RentalIntervalDto(this.type, this.startTime?.substring(0, 5) ?? null);
  }
}
