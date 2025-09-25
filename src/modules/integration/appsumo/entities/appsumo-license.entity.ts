import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { AppsumoLicenseStatus } from '../enums';

@Entity()
export class AppsumoLicense {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  licenseKey: string;

  @Column({ nullable: true })
  prevLicenseKey: string | null;

  @Column()
  licenseStatus: AppsumoLicenseStatus;

  @Column()
  planId: string;

  @Column()
  tier: number;

  @Column({ nullable: true })
  accountId: number | null;

  @Column({ type: Date })
  createdAt: Date;

  constructor(
    licenseKey: string,
    prevLicenseKey: string | null,
    licenseStatus: AppsumoLicenseStatus,
    planId: string,
    tier: number,
    accountId: number | null,
    createdAt?: Date,
  ) {
    this.licenseKey = licenseKey;
    this.prevLicenseKey = prevLicenseKey;
    this.licenseStatus = licenseStatus;
    this.planId = planId;
    this.tier = tier;
    this.accountId = accountId;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  public update({
    licenseKey,
    prevLicenseKey,
    licenseStatus,
    planId,
    tier,
    accountId,
  }: {
    licenseKey?: string;
    prevLicenseKey?: string | null;
    licenseStatus?: AppsumoLicenseStatus;
    planId?: string;
    tier?: number;
    accountId?: number | null;
  }): AppsumoLicense {
    this.licenseKey = licenseKey !== undefined ? licenseKey : this.licenseKey;
    this.prevLicenseKey = prevLicenseKey !== undefined ? prevLicenseKey : this.prevLicenseKey;
    this.licenseStatus = licenseStatus !== undefined ? licenseStatus : this.licenseStatus;
    this.planId = planId !== undefined ? planId : this.planId;
    this.tier = tier !== undefined ? tier : this.tier;
    this.accountId = accountId !== undefined ? accountId : this.accountId;

    return this;
  }
}
