import { Column, Entity, PrimaryColumn } from 'typeorm';

import { DateFormat } from '@/common';

import { PhoneFormat } from '../../common';
import { CreateAccountSettingsDto, UpdateAccountSettingsDto, AccountSettingsDto } from '../dto';

const SettingsDefault = {
  language: 'en',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  startOfWeek: 'Monday',
  workingTimeFrom: '9:00:00',
  workingTimeTo: '18:00:00',
  timeZone: 'America/Los_Angeles',
  currency: 'USD',
  numberFormat: '9.999.999,99',
  phoneFormat: PhoneFormat.INTERNATIONAL,
  allowDuplicates: false,
};

@Entity()
export class AccountSettings {
  @PrimaryColumn()
  accountId: number;

  @Column()
  language: string;

  @Column({ type: 'simple-array', nullable: true })
  workingDays: string[] | null;

  @Column({ nullable: true })
  startOfWeek: string | null;

  @Column({ type: 'time', nullable: true })
  workingTimeFrom: string | null;

  @Column({ type: 'time', nullable: true })
  workingTimeTo: string | null;

  @Column({ nullable: true })
  timeZone: string | null;

  @Column()
  currency: string;

  @Column({ nullable: true })
  numberFormat: string | null;

  @Column()
  phoneFormat: PhoneFormat;

  @Column()
  allowDuplicates: boolean;

  @Column({ nullable: true })
  dateFormat: DateFormat | null;

  @Column({ default: false })
  isBpmnEnable: boolean;

  constructor(
    accountId: number,
    language: string,
    workingDays: string[] | null,
    startOfWeek: string | null,
    workingTimeFrom: string | null,
    workingTimeTo: string | null,
    timeZone: string | null,
    currency: string,
    numberFormat: string | null,
    phoneFormat: PhoneFormat,
    allowDuplicates: boolean,
    dateFormat: DateFormat | null,
    isBpmnEnable = false,
  ) {
    this.accountId = accountId;
    this.language = language;
    this.workingDays = workingDays;
    this.startOfWeek = startOfWeek;
    this.workingTimeFrom = workingTimeFrom;
    this.workingTimeTo = workingTimeTo;
    this.timeZone = timeZone;
    this.currency = currency;
    this.numberFormat = numberFormat;
    this.phoneFormat = phoneFormat;
    this.allowDuplicates = allowDuplicates;
    this.dateFormat = dateFormat;
    this.isBpmnEnable = isBpmnEnable;
  }

  public static fromDto(accountId: number, dto?: CreateAccountSettingsDto | UpdateAccountSettingsDto): AccountSettings {
    return new AccountSettings(
      accountId,
      dto?.language ?? SettingsDefault.language,
      dto?.workingDays ?? SettingsDefault.workingDays,
      dto?.startOfWeek ?? SettingsDefault.startOfWeek,
      dto?.workingTimeFrom ?? SettingsDefault.workingTimeFrom,
      dto?.workingTimeTo ?? SettingsDefault.workingTimeTo,
      dto?.timeZone ?? SettingsDefault.timeZone,
      dto?.currency ?? SettingsDefault.currency,
      dto?.numberFormat ?? SettingsDefault.numberFormat,
      dto?.phoneFormat ?? SettingsDefault.phoneFormat,
      dto?.allowDuplicates ?? SettingsDefault.allowDuplicates,
      dto?.dateFormat ?? null,
    );
  }

  public update(dto: UpdateAccountSettingsDto): AccountSettings {
    this.language = dto.language !== undefined ? dto.language : this.language;
    this.workingDays = dto.workingDays !== undefined ? dto.workingDays : this.workingDays;
    this.startOfWeek = dto.startOfWeek !== undefined ? dto.startOfWeek : this.startOfWeek;
    this.workingTimeFrom = dto.workingTimeFrom !== undefined ? dto.workingTimeFrom : this.workingTimeFrom;
    this.workingTimeTo = dto.workingTimeTo !== undefined ? dto.workingTimeTo : this.workingTimeTo;
    this.timeZone = dto.timeZone !== undefined ? dto.timeZone : this.timeZone;
    this.currency = dto.currency !== undefined ? dto.currency : this.currency;
    this.numberFormat = dto.numberFormat !== undefined ? dto.numberFormat : this.numberFormat;
    this.phoneFormat = dto.phoneFormat !== undefined ? dto.phoneFormat : this.phoneFormat;
    this.allowDuplicates = dto.allowDuplicates !== undefined ? dto.allowDuplicates : this.allowDuplicates;
    this.dateFormat = dto.dateFormat !== undefined ? dto.dateFormat : this.dateFormat;

    return this;
  }

  public toDto(): AccountSettingsDto {
    return {
      language: this.language,
      workingDays: this.workingDays,
      startOfWeek: this.startOfWeek,
      workingTimeFrom: this.workingTimeFrom.substring(0, 5),
      workingTimeTo: this.workingTimeTo.substring(0, 5),
      timeZone: this.timeZone,
      currency: this.currency,
      numberFormat: this.numberFormat,
      phoneFormat: this.phoneFormat,
      allowDuplicates: this.allowDuplicates,
      dateFormat: this.dateFormat,
      isBpmnEnable: this.isBpmnEnable,
    };
  }
}
