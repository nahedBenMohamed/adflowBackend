import { Column, Entity, PrimaryColumn } from 'typeorm';
import { VoximplantAccountDto } from '../dto';

@Entity()
export class VoximplantAccount {
  @PrimaryColumn()
  accountId: number;

  @Column()
  externalId: number;

  @Column()
  accountName: string;

  @Column()
  accountEmail: string;

  @Column()
  apiKey: string;

  @Column()
  password: string;

  @Column()
  billingAccountId: number;

  @Column()
  isActive: boolean;

  @Column()
  keyId: string;

  @Column()
  privateKey: string;

  @Column()
  applicationId: number;

  @Column()
  applicationName: string;

  constructor(
    accountId: number,
    externalId: number,
    accountName: string,
    accountEmail: string,
    apiKey: string,
    password: string,
    billingAccountId: number,
    isActive: boolean,
    keyId: string,
    privateKey: string,
    applicationId: number,
    applicationName: string,
  ) {
    this.accountId = accountId;
    this.externalId = externalId;
    this.accountName = accountName;
    this.accountEmail = accountEmail;
    this.apiKey = apiKey;
    this.password = password;
    this.billingAccountId = billingAccountId;
    this.isActive = isActive;
    this.keyId = keyId;
    this.privateKey = privateKey;
    this.applicationId = applicationId;
    this.applicationName = applicationName;
  }

  public toDto(): VoximplantAccountDto {
    return new VoximplantAccountDto(
      this.externalId,
      this.accountName,
      this.apiKey,
      this.billingAccountId,
      this.applicationId,
      this.applicationName,
      this.isActive,
    );
  }
}
