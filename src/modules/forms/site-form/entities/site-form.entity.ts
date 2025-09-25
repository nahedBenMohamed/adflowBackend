import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { SiteFormConsent } from '../../site-form-consent';
import { SiteFormGratitude } from '../../site-form-gratitude';
import { SiteFormPage } from '../../site-form-page';

import type { CreateSiteFormDto, SiteFormDto, UpdateSiteFormDto } from '../dto';
import { SiteFormType } from '../enums';
import { SiteFormEntityType } from './site-form-entity-type.entity';
import { SiteFormSchedule } from './site-form-schedule.entity';

@Entity()
export class SiteForm {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  createdBy: number;

  @Column()
  type: SiteFormType;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column()
  isActive: boolean;

  @Column({ default: false })
  isHeadless: boolean;

  @Column({ nullable: true, default: null })
  title: string | null;

  @Column({ nullable: true, default: null })
  responsibleId: number | null;

  @Column({ type: 'jsonb', nullable: true, default: null })
  design: object | null;

  @Column({ default: false })
  fieldLabelEnabled: boolean;

  @Column({ default: true })
  fieldPlaceholderEnabled: boolean;

  @Column({ default: false })
  multiformEnabled: boolean;

  @Column({ default: null })
  scheduleLimitDays: number | null;

  @Column({ default: false })
  checkDuplicate: boolean;

  constructor(
    accountId: number,
    createdBy: number,
    type: SiteFormType,
    name: string,
    code: string,
    isActive: boolean,
    isHeadless: boolean,
    title: string | null,
    responsibleId: number | null,
    design: object | null,
    fieldLabelEnabled: boolean,
    fieldPlaceholderEnabled: boolean,
    multiformEnabled: boolean,
    scheduleLimitDays: number | null,
    checkDuplicate: boolean,
  ) {
    this.accountId = accountId;
    this.createdBy = createdBy;
    this.type = type;
    this.name = name;
    this.code = code;
    this.isActive = isActive;
    this.isHeadless = isHeadless;
    this.title = title;
    this.responsibleId = responsibleId;
    this.design = design;
    this.fieldLabelEnabled = fieldLabelEnabled;
    this.fieldPlaceholderEnabled = fieldPlaceholderEnabled;
    this.multiformEnabled = multiformEnabled;
    this.scheduleLimitDays = scheduleLimitDays;
    this.checkDuplicate = checkDuplicate;
  }

  private _consent: SiteFormConsent | null;
  get consent(): SiteFormConsent | null {
    return this._consent;
  }
  set consent(value: SiteFormConsent | null) {
    this._consent = value;
  }

  private _gratitude: SiteFormGratitude | null;
  get gratitude(): SiteFormGratitude | null {
    return this._gratitude;
  }
  set gratitude(value: SiteFormGratitude | null) {
    this._gratitude = value;
  }

  private _pages: SiteFormPage[] | null;
  get pages(): SiteFormPage[] | null {
    return this._pages;
  }
  set pages(value: SiteFormPage[] | null) {
    this._pages = value;
  }

  private _entityTypeLinks: SiteFormEntityType[] | null;
  get entityTypeLinks(): SiteFormEntityType[] | null {
    return this._entityTypeLinks;
  }
  set entityTypeLinks(value: SiteFormEntityType[] | null) {
    this._entityTypeLinks = value;
  }

  private _scheduleLinks: SiteFormSchedule[] | null;
  get scheduleLinks(): SiteFormSchedule[] | null {
    return this._scheduleLinks;
  }
  set scheduleLinks(value: SiteFormSchedule[] | null) {
    this._scheduleLinks = value;
  }

  static fromDto(
    accountId: number,
    createdBy: number,
    code: string,
    dto: CreateSiteFormDto,
    isActive = true,
  ): SiteForm {
    return new SiteForm(
      accountId,
      createdBy,
      dto.type,
      dto.name,
      code,
      isActive,
      dto.isHeadless ?? false,
      dto.title,
      dto.responsibleId,
      dto.design,
      dto.fieldLabelEnabled,
      dto.fieldPlaceholderEnabled,
      dto.multiformEnabled,
      dto.scheduleLimitDays,
      dto.checkDuplicate,
    );
  }

  update(dto: UpdateSiteFormDto): SiteForm {
    this.type = dto.type !== undefined ? dto.type : this.type;
    this.name = dto.name !== undefined ? dto.name : this.name;
    this.isActive = dto.isActive !== undefined ? dto.isActive : this.isActive;
    this.isHeadless = dto.isHeadless !== undefined ? dto.isHeadless : this.isHeadless;
    this.title = dto.title !== undefined ? dto.title : this.title;
    this.responsibleId = dto.responsibleId !== undefined ? dto.responsibleId : this.responsibleId;
    this.design = dto.design !== undefined ? dto.design : this.design;
    this.fieldLabelEnabled = dto.fieldLabelEnabled !== undefined ? dto.fieldLabelEnabled : this.fieldLabelEnabled;
    this.fieldPlaceholderEnabled =
      dto.fieldPlaceholderEnabled !== undefined ? dto.fieldPlaceholderEnabled : this.fieldPlaceholderEnabled;
    this.multiformEnabled = dto.multiformEnabled !== undefined ? dto.multiformEnabled : this.multiformEnabled;
    this.scheduleLimitDays = dto.scheduleLimitDays !== undefined ? dto.scheduleLimitDays : this.scheduleLimitDays;
    this.checkDuplicate = dto.checkDuplicate !== undefined ? dto.checkDuplicate : this.checkDuplicate;

    return this;
  }

  toDto(): SiteFormDto {
    return {
      id: this.id,
      createdBy: this.createdBy,
      type: this.type,
      name: this.name,
      code: this.code,
      isActive: this.isActive,
      isHeadless: this.isHeadless,
      title: this.title,
      responsibleId: this.responsibleId,
      design: this.design,
      fieldLabelEnabled: this.fieldLabelEnabled,
      fieldPlaceholderEnabled: this.fieldPlaceholderEnabled,
      multiformEnabled: this.multiformEnabled,
      scheduleLimitDays: this.scheduleLimitDays,
      checkDuplicate: this.checkDuplicate,
      consent: this.consent ? this.consent.toDto() : this.consent,
      gratitude: this.gratitude ? this.gratitude.toDto() : this.gratitude,
      pages: this.pages ? this.pages?.map((p) => p.toDto()) : this.pages,
      entityTypeLinks: this.entityTypeLinks ? this.entityTypeLinks?.map((l) => l.toDto()) : this.entityTypeLinks,
      scheduleLinks: this.scheduleLinks ? this.scheduleLinks?.map((l) => l.toDto()) : this.scheduleLinks,
    };
  }
}
