import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import {
  SiteFormFieldDto,
  SiteFormFieldEntityFieldDto,
  SiteFormFieldEntityNameDto,
  type CreateSiteFormFieldDto,
  type UpdateSiteFormFieldDto,
} from '../dto';
import { SiteFormFieldType } from '../enums';

@Entity()
export class SiteFormField {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  pageId: number;

  @Column({ nullable: true })
  label: string | null;

  @Column({ nullable: true })
  placeholder: string | null;

  @Column()
  sortOrder: number;

  @Column()
  type: SiteFormFieldType;

  @Column({ nullable: true })
  isRequired: boolean | null;

  @Column({ nullable: true })
  entityTypeId: number | null;

  @Column({ nullable: true })
  fieldId: number | null;

  @Column({ nullable: true })
  isValidationRequired: boolean | null;

  @Column({ type: 'jsonb', nullable: true })
  meta?: object | null;

  constructor(
    accountId: number,
    pageId: number,
    label: string | null,
    placeholder: string | null,
    sortOrder: number,
    type: SiteFormFieldType,
    isRequired: boolean | null,
    entityTypeId: number | null,
    fieldId: number | null,
    isValidationRequired: boolean | null,
    meta?: object | null,
  ) {
    this.accountId = accountId;
    this.pageId = pageId;
    this.label = label;
    this.placeholder = placeholder;
    this.sortOrder = sortOrder;
    this.type = type;
    this.isRequired = isRequired;
    this.entityTypeId = entityTypeId;
    this.fieldId = fieldId;
    this.isValidationRequired = isValidationRequired;
    this.meta = meta;
  }

  public static fromDto(accountId: number, pageId: number, dto: CreateSiteFormFieldDto): SiteFormField {
    const fieldSettings =
      dto.type === SiteFormFieldType.EntityField ? (dto.settings as SiteFormFieldEntityFieldDto) : undefined;
    return new SiteFormField(
      accountId,
      pageId,
      dto.label,
      dto.placeholder,
      dto.sortOrder,
      dto.type,
      dto.isRequired,
      dto.settings?.entityTypeId ?? null,
      fieldSettings?.fieldId ?? null,
      fieldSettings?.isValidationRequired ?? null,
      fieldSettings?.meta ?? null,
    );
  }

  public update(dto: UpdateSiteFormFieldDto): SiteFormField {
    this.label = dto.label !== undefined ? dto.label : this.label;
    this.placeholder = dto.placeholder !== undefined ? dto.placeholder : this.placeholder;
    this.isRequired = dto.isRequired !== undefined ? dto.isRequired : this.isRequired;
    this.sortOrder = dto.sortOrder !== undefined ? dto.sortOrder : this.sortOrder;
    this.entityTypeId = dto.settings?.entityTypeId !== undefined ? dto.settings.entityTypeId : this.entityTypeId;

    const settings =
      this.type === SiteFormFieldType.EntityField ? (dto.settings as SiteFormFieldEntityFieldDto) : undefined;
    if (settings) {
      this.fieldId = settings.fieldId !== undefined ? settings.fieldId : this.fieldId;
      this.isValidationRequired =
        settings.isValidationRequired !== undefined ? settings.isValidationRequired : this.isValidationRequired;
      this.meta = settings.meta !== undefined ? settings.meta : this.meta;
    }

    return this;
  }

  public toDto(): SiteFormFieldDto {
    return {
      id: this.id,
      label: this.label,
      placeholder: this.placeholder,
      type: this.type,
      isRequired: this.isRequired,
      sortOrder: this.sortOrder,
      settings: this.formatSettings(),
    };
  }

  private formatSettings(): SiteFormFieldEntityFieldDto | SiteFormFieldEntityNameDto | null {
    switch (this.type) {
      case SiteFormFieldType.EntityField:
        return {
          entityTypeId: this.entityTypeId,
          fieldId: this.fieldId,
          isValidationRequired: this.isValidationRequired,
          meta: this.meta,
        };
      case SiteFormFieldType.EntityName:
        return {
          entityTypeId: this.entityTypeId,
        };
      default:
        return null;
    }
  }
}
