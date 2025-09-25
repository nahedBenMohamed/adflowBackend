import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { AccountSubscriptionService } from '../account-subscription/account-subscription.service';
import { SubscriptionDiscount } from './entities';
import { CurrentDiscount } from './types';
import { DateUtil } from '@/common';

@Injectable()
export class SubscriptionDiscountService {
  constructor(
    @InjectRepository(SubscriptionDiscount)
    private readonly repository: Repository<SubscriptionDiscount>,
    private readonly subscriptionService: AccountSubscriptionService,
  ) {}

  async findByAccount(accountId: number): Promise<CurrentDiscount | null> {
    const subscription = await this.subscriptionService.get(accountId);

    return subscription?.firstVisit ? this.findByDate(subscription.firstVisit) : null;
  }

  async findByDate(date: Date): Promise<CurrentDiscount | null> {
    const discount = await this.createFindQb(date).limit(1).getOne();

    if (discount) {
      const endAt = DateUtil.add(date, { days: discount.days });
      return new CurrentDiscount({ percent: discount.percent, endAt, code: discount.code });
    }

    return null;
  }

  async findMany(date: Date): Promise<CurrentDiscount[]> {
    const discounts = await this.createFindQb(date).getMany();
    return discounts.map(
      (discount) =>
        new CurrentDiscount({
          percent: discount.percent,
          endAt: DateUtil.add(date, { days: discount.days }),
          code: discount.code,
        }),
    );
  }

  private createFindQb(date: Date) {
    const days = DateUtil.diff({ startDate: date, endDate: DateUtil.now(), unit: 'day', abs: false });
    return this.repository
      .createQueryBuilder('discount')
      .where('discount.days > :days', { days })
      .andWhere(
        new Brackets((qb1) =>
          qb1.where('discount.valid_until > :date', { date }).orWhere('discount.valid_until is null'),
        ),
      )
      .orderBy('discount.valid_until', 'ASC')
      .addOrderBy('discount.days', 'ASC');
  }
}
