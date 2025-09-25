import { Column, Entity, PrimaryColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { AccountSubscriptionDto, CreateAccountSubscriptionDto, UpdateAccountSubscriptionDto } from '../dto';

const DefaultSubscription = {
  isTrial: true,
  duration: 7,
  userLimit: 50,
  planName: 'All in One',
};

@Entity()
export class AccountSubscription {
  @PrimaryColumn()
  accountId: number;

  @Column()
  createdAt: Date;

  @Column()
  isTrial: boolean;

  @Column()
  expiredAt: Date | null;

  @Column()
  userLimit: number;

  @Column()
  planName: string;

  @Column({ nullable: true })
  externalCustomerId: string | null;

  @Column()
  firstVisit: Date;

  constructor(
    accountId: number,
    isTrial: boolean,
    createdAt: Date,
    expiredAt: Date | null,
    userLimit: number,
    planName: string,
    firstVisit: Date,
  ) {
    this.accountId = accountId;
    this.isTrial = isTrial;
    this.createdAt = createdAt;
    this.expiredAt = expiredAt;
    this.userLimit = userLimit;
    this.planName = planName;
    this.firstVisit = firstVisit ?? createdAt;
  }

  static create(accountId: number, dto?: CreateAccountSubscriptionDto): AccountSubscription {
    const now = dto?.createdAt ? DateUtil.fromISOString(dto?.createdAt) : DateUtil.now();
    return new AccountSubscription(
      accountId,
      dto?.isTrial ?? DefaultSubscription.isTrial,
      now,
      DateUtil.add(now, { days: dto?.termInDays ?? DefaultSubscription.duration }),
      dto?.userLimit ?? DefaultSubscription.userLimit,
      dto?.planName ?? DefaultSubscription.planName,
      dto?.firstVisit ? DateUtil.fromISOString(dto.firstVisit) : null,
    );
  }

  update(dto: UpdateAccountSubscriptionDto): AccountSubscription {
    this.isTrial = dto.isTrial !== undefined ? dto.isTrial : this.isTrial;
    this.createdAt = dto.periodStart !== undefined ? DateUtil.fromISOString(dto.periodStart) : this.createdAt;
    this.expiredAt = dto.periodEnd !== undefined ? DateUtil.fromISOString(dto.periodEnd) : this.expiredAt;
    this.userLimit = dto.userLimit !== undefined ? dto.userLimit : this.userLimit;
    this.planName = dto.planName !== undefined ? dto.planName : this.planName;
    this.externalCustomerId = dto.externalCustomerId !== undefined ? dto.externalCustomerId : this.externalCustomerId;
    this.firstVisit = dto.firstVisit !== undefined ? DateUtil.fromISOString(dto.firstVisit) : this.firstVisit;

    return this;
  }

  toDto(): AccountSubscriptionDto {
    return {
      isValid: this.isValid(),
      isTrial: this.isTrial,
      createdAt: this.createdAt.toISOString(),
      expiredAt: this.expiredAt?.toISOString(),
      userLimit: this.userLimit,
      planName: this.planName,
      isExternal: !!this.externalCustomerId,
      firstVisit: this.firstVisit.toISOString(),
    };
  }

  private isValid(): boolean {
    return DateUtil.isFuture(this.expiredAt);
  }
}
