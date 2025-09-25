import { Column, Entity, PrimaryColumn } from 'typeorm';

import { type CreateSiteFormConsentDto, SiteFormConsentDto, type UpdateSiteFormConsentDto } from '../dto';

@Entity()
export class SiteFormConsent {
  @Column()
  accountId: number;

  @PrimaryColumn()
  formId: number;

  @Column({ default: false })
  isEnabled: boolean;

  @Column({ nullable: true })
  text: string | null;

  @Column({ nullable: true })
  linkUrl: string | null;

  @Column({ nullable: true })
  linkText: string | null;

  @Column({ default: false })
  defaultValue: boolean;

  constructor(
    accountId: number,
    formId: number,
    isEnabled: boolean,
    text: string | null,
    linkUrl: string | null,
    linkText: string | null,
    defaultValue: boolean,
  ) {
    this.accountId = accountId;
    this.formId = formId;
    this.isEnabled = isEnabled;
    this.text = text;
    this.linkUrl = linkUrl;
    this.linkText = linkText;
    this.defaultValue = defaultValue;
  }

  public static fromDto(accountId: number, formId: number, dto: CreateSiteFormConsentDto): SiteFormConsent {
    return new SiteFormConsent(accountId, formId, dto.isEnabled, dto.text, dto.linkUrl, dto.linkText, dto.defaultValue);
  }

  public update(dto: UpdateSiteFormConsentDto): SiteFormConsent {
    this.isEnabled = dto.isEnabled !== undefined ? dto.isEnabled : this.isEnabled;
    this.text = dto.text !== undefined ? dto.text : this.text;
    this.linkUrl = dto.linkUrl !== undefined ? dto.linkUrl : this.linkUrl;
    this.linkText = dto.linkText !== undefined ? dto.linkText : this.linkText;
    this.defaultValue = dto.defaultValue !== undefined ? dto.defaultValue : this.defaultValue;

    return this;
  }

  public toDto(): SiteFormConsentDto {
    return {
      formId: this.formId,
      isEnabled: this.isEnabled,
      text: this.text,
      linkUrl: this.linkUrl,
      linkText: this.linkText,
      defaultValue: this.defaultValue,
    };
  }
}
