import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { SiteFormField } from '../../site-form-field';
import { SiteFormPageDto, type CreateSiteFormPageDto, type UpdateSiteFormPageDto } from '../dto';

@Entity()
export class SiteFormPage {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  formId: number;

  @Column({ nullable: true })
  title: string | null;

  @Column()
  sortOrder: number;

  constructor(accountId: number, formId: number, title: string | null, sortOrder: number) {
    this.accountId = accountId;
    this.formId = formId;
    this.title = title;
    this.sortOrder = sortOrder;
  }

  private _fields: SiteFormField[] | null;
  public get fields(): SiteFormField[] | null {
    return this._fields;
  }
  public set fields(value: SiteFormField[] | null) {
    this._fields = value;
  }

  public static fromDto(accountId: number, formId: number, dto: CreateSiteFormPageDto): SiteFormPage {
    return new SiteFormPage(accountId, formId, dto.title, dto.sortOrder);
  }

  public update(dto: UpdateSiteFormPageDto): SiteFormPage {
    this.title = dto.title !== undefined ? dto.title : this.title;
    this.sortOrder = dto.sortOrder !== undefined ? dto.sortOrder : this.sortOrder;

    return this;
  }

  public toDto(): SiteFormPageDto {
    return {
      id: this.id,
      title: this.title,
      sortOrder: this.sortOrder,
      fields: this.fields ? this.fields?.map((f) => f.toDto()) : this.fields,
    };
  }
}
