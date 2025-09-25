import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DatePeriod, DateUtil } from '@/common';

import { SalesPlanDto } from '../dto/sales-plan.dto';

@Entity()
export class SalesPlan {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  entityTypeId: number;

  @Column()
  userId: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ nullable: true })
  quantity: number | null;

  @Column({ nullable: true })
  amount: number | null;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(
    entityTypeId: number,
    userId: number,
    startDate: Date,
    endDate: Date,
    quantity: number | null,
    amount: number | null,
    accountId: number,
    createdAt?: Date,
  ) {
    this.entityTypeId = entityTypeId;
    this.userId = userId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.quantity = quantity;
    this.amount = amount;
    this.accountId = accountId;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  public static fromDto(accountId: number, entityTypeId: number, dto: SalesPlanDto): SalesPlan {
    const period = DatePeriod.fromDto(dto.period);
    return new SalesPlan(entityTypeId, dto.userId, period.from, period.to, dto.quantity, dto.amount, accountId);
  }

  public update(dto: SalesPlanDto): SalesPlan {
    this.amount = dto.amount;
    this.quantity = dto.quantity;

    return this;
  }

  public toDto(): SalesPlanDto {
    return new SalesPlanDto(
      this.userId,
      new DatePeriod(this.startDate, this.endDate).toDto(),
      this.quantity,
      this.amount,
    );
  }
}
