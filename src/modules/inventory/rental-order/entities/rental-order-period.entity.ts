import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DatePeriodDto } from '@/common';

@Entity()
export class RentalOrderPeriod {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  orderId: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  accountId: number;

  constructor(accountId: number, orderId: number, startDate: Date, endDate: Date) {
    this.accountId = accountId;
    this.orderId = orderId;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  public static fromDto(accountId: number, orderId: number, dto: DatePeriodDto): RentalOrderPeriod {
    return new RentalOrderPeriod(accountId, orderId, new Date(dto.startDate), new Date(dto.endDate));
  }

  public toDto(): DatePeriodDto {
    return { startDate: this.startDate.toISOString(), endDate: this.endDate.toISOString() };
  }
}
