import { Column, Entity, PrimaryColumn } from 'typeorm';

import { type CreateSiteFormGratitudeDto, SiteFormGratitudeDto, type UpdateSiteFormGratitudeDto } from '../dto';

@Entity()
export class SiteFormGratitude {
  @Column()
  accountId: number;

  @PrimaryColumn()
  formId: number;

  @Column({ default: false })
  isEnabled: boolean;

  @Column({ nullable: true })
  header: string | null;

  @Column({ nullable: true })
  text: string | null;

  constructor(accountId: number, formId: number, isEnabled: boolean, header: string | null, text: string | null) {
    this.accountId = accountId;
    this.formId = formId;
    this.isEnabled = isEnabled;
    this.header = header;
    this.text = text;
  }

  public static fromDto(accountId: number, formId: number, dto: CreateSiteFormGratitudeDto): SiteFormGratitude {
    return new SiteFormGratitude(accountId, formId, dto.isEnabled, dto.header, dto.text);
  }

  public update(dto: UpdateSiteFormGratitudeDto): SiteFormGratitude {
    this.isEnabled = dto.isEnabled !== undefined ? dto.isEnabled : this.isEnabled;
    this.header = dto.header !== undefined ? dto.header : this.header;
    this.text = dto.text !== undefined ? dto.text : this.text;

    return this;
  }

  public toDto(): SiteFormGratitudeDto {
    return { formId: this.formId, isEnabled: this.isEnabled, header: this.header, text: this.text };
  }
}
