import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { AccountDto } from '../dto';

@Entity()
export class Account {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  companyName: string;

  @Column()
  subdomain: string;

  @Column({ nullable: true })
  logoId: string | null;

  @Column()
  createdAt: Date;

  constructor(companyName: string, subdomain: string, logoId: string | null, createdAt?: Date) {
    this.companyName = companyName;
    this.subdomain = subdomain;
    this.logoId = logoId;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  private _logoUrl: string | null = null;
  public get logoUrl(): string | null {
    return this._logoUrl;
  }
  public set logoUrl(value: string | null) {
    this._logoUrl = value;
  }

  public toDto(): AccountDto {
    return {
      id: this.id,
      companyName: this.companyName,
      subdomain: this.subdomain,
      logoUrl: this.logoUrl,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
