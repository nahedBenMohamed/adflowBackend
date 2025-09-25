import { Injectable } from '@nestjs/common';

import { DateUtil } from '@/common';

import { UserService } from '@/modules/iam/user/user.service';
import { User } from '@/modules/iam/user/entities';
import { DepartmentService } from '@/modules/iam/department/department.service';
import { FieldService } from '@/modules/entity/entity-field/field';
import { EntityService } from '@/CRM/Service/Entity/EntityService';
import { Entity } from '@/CRM/Model/Entity/Entity';
import { CreateSimpleEntityDto } from '@/CRM/Service/Entity/Dto/CreateSimpleEntityDto';
import { SimpleFieldValueDto } from '@/modules/entity/entity-field/field-value/dto/simple-field-value.dto';
import { StorageService } from '@/modules/storage/storage.service';
import { StorageFile } from '@/modules/storage/types';
import { ScheduleAppointmentStatus } from '@/modules/scheduler/common';
import { ScheduleService } from '@/modules/scheduler/schedule/services/schedule.service';
import { ScheduleAppointmentService } from '@/modules/scheduler/schedule-appointment/schedule-appointment.service';

import { SiteForm, SiteFormEntityType, SiteFormService } from '../site-form';
import { SiteFormField, SiteFormFieldType } from '../site-form-field';

import {
  PublicSiteFormDto,
  PublicSiteFormFieldDto,
  PublicSiteFormFieldEntityFieldDto,
  PublicSiteFormFieldScheduleDateDto,
  PublicSiteFormFieldScheduleDto,
  PublicSiteFormFieldScheduleTimeDto,
  PublicSiteFormPageDto,
  SiteFormAnalyticDataDto,
  SiteFormDataDto,
  SiteFormDataPlainDto,
  SiteFormFieldDataDto,
  SiteFormFileUploadResult,
  SiteFormResultDto,
} from './dto';

@Injectable()
export class SiteFormBuilderService {
  constructor(
    private readonly userService: UserService,
    private readonly departmentService: DepartmentService,
    private readonly formService: SiteFormService,
    private readonly fieldService: FieldService,
    private readonly entityService: EntityService,
    private readonly storageService: StorageService,
    private readonly scheduleService: ScheduleService,
    private readonly appointmentService: ScheduleAppointmentService,
  ) {}

  async find({
    code,
    dto,
    timezone,
  }: {
    code: string;
    dto: SiteFormDataDto;
    timezone?: string;
  }): Promise<PublicSiteFormDto | null> {
    const form = await this.formService.findByCode(code, {
      expand: ['consent', 'gratitude', 'pages.fields', 'scheduleLinks'],
    });

    return form
      ? {
          code: form.code,
          title: form.title,
          design: form.design,
          fieldLabelEnabled: form.fieldLabelEnabled,
          fieldPlaceholderEnabled: form.fieldPlaceholderEnabled,
          consent: form.consent
            ? {
                isEnabled: form.consent.isEnabled,
                text: form.consent.text,
                linkUrl: form.consent.linkUrl,
                linkText: form.consent.linkText,
                defaultValue: form.consent.defaultValue,
              }
            : form.consent,
          gratitude: form.gratitude
            ? { isEnabled: form.gratitude.isEnabled, header: form.gratitude.header, text: form.gratitude.text }
            : form.gratitude,
          pages: form.pages ? await this.getPublicPages({ form, dto, timezone }) : undefined,
        }
      : null;
  }

  async getField({
    code,
    fieldId,
    dto,
    timezone,
  }: {
    code: string;
    fieldId: number;
    dto?: SiteFormDataDto;
    timezone?: string;
  }): Promise<PublicSiteFormFieldDto> {
    const form = await this.formService.findByCode(code, {
      expand: ['pages.fields', 'scheduleLinks'],
    });

    if (form) {
      const formField = form.pages.flatMap((p) => p.fields).find((f) => f.id === fieldId);
      if (formField) {
        return this.getPublicField({ form, formField, dto, timezone });
      }
    }

    return null;
  }

  async post({ code, dto }: { code: string; dto?: SiteFormDataDto }): Promise<SiteFormResultDto> {
    if (!dto || dto.test) {
      return { result: true, message: `Form ${code} test is OK` };
    }

    const form = await this.formService.findByCode(code, {
      expand: ['pages.fields', 'entityTypeLinks', 'scheduleLinks'],
    });

    if (!form) {
      return { result: false, message: `Form ${code} not found` };
    }

    if (!this.checkRequiredFields({ form, fields: dto.fields })) {
      return { result: false, message: `Required field(s) not set` };
    }

    const user = await this.userService.findOne({ accountId: form.accountId, id: form.createdBy });
    if (!user) {
      return { result: false, message: `User ${form.createdBy} not found` };
    }

    const entity = await this.createEntities({ form, user, dto });

    if (form.scheduleLinks?.length) {
      await this.createAppointment({ form, user, entity, dto });
    }

    return { result: true, message: `Form ${code} submitted successfully` };
  }

  async postPlain({ code, dto }: { code: string; dto?: SiteFormDataPlainDto }): Promise<SiteFormResultDto> {
    return this.post({ code, dto: this.convertPlainToDto(dto) });
  }

  async uploadFiles({
    code,
    files,
  }: {
    code: string;
    files: Express.Multer.File[];
  }): Promise<SiteFormFileUploadResult[]> {
    const form = await this.formService.findByCode(code);
    if (form) {
      const fileInfos = await Promise.all(
        files
          .map((file) => ({ key: file.fieldname, file: StorageFile.fromMulter(file) }))
          .map(async (file) => ({
            key: file.key,
            info: await this.storageService.storeCommonFile({ accountId: form.accountId, file: file.file }),
          })),
      );
      return fileInfos.map((file) => ({
        key: file.key,
        id: file.info.id,
        fileName: file.info.originalName,
        fileSize: file.info.size,
        mimeType: file.info.mimeType,
        createdAt: file.info.createdAt.toISOString(),
      }));
    }
    return [];
  }

  private convertPlainToDto(plain: SiteFormDataPlainDto | null | undefined): SiteFormDataDto | undefined {
    if (!plain) {
      return undefined;
    }

    const fields = Object.entries(plain)
      .map(([key, value]) => {
        const id = Number(key);
        return !isNaN(id) ? { id, value } : null;
      })
      .filter(Boolean);

    return { test: plain.test, fields };
  }

  private checkRequiredFields({ form, fields }: { form: SiteForm; fields?: SiteFormFieldDataDto[] }): boolean {
    const requiredFormFields = form.pages.flatMap((p) => p.fields).filter((f) => f.isRequired);
    for (const requiredFormField of requiredFormFields) {
      const fieldDto = fields?.find((fd) => fd.id === requiredFormField.id);
      if (!fieldDto || !fieldDto.value) {
        return false;
      }
    }
    return true;
  }

  private async createEntities({
    form,
    user,
    dto,
  }: {
    form: SiteForm;
    user: User;
    dto: SiteFormDataDto;
  }): Promise<Entity | undefined> {
    const mainEntityType = form.entityTypeLinks.find((etl) => etl.isMain);
    const mainEntity = mainEntityType
      ? await this.createEntity({ form, user, entityType: mainEntityType, data: dto })
      : undefined;

    if (mainEntity) {
      const linkedEntityTypes = form.entityTypeLinks.filter((etl) => !etl.isMain);
      await Promise.all(
        linkedEntityTypes.map((et) =>
          this.createEntity({ form, user, entityType: et, data: dto, options: { linkedEntities: [mainEntity.id] } }),
        ),
      );
    }

    return mainEntity;
  }

  private async createEntity({
    form,
    user,
    entityType,
    data,
    options,
  }: {
    form: SiteForm;
    user: User;
    entityType: SiteFormEntityType;
    data: SiteFormDataDto;
    options?: { linkedEntities?: number[] };
  }) {
    const dto = this.getEntityDto({ form, entityType, fields: data.fields, analytics: data.analytics });

    const [entity] = await this.entityService.createSimple({
      accountId: form.accountId,
      user,
      dto,
      options: { linkedEntities: options?.linkedEntities, checkDuplicate: form.checkDuplicate },
    });

    return entity;
  }

  private getEntityDto({
    form,
    entityType,
    fields,
    analytics,
  }: {
    form: SiteForm;
    entityType: SiteFormEntityType;
    fields?: SiteFormFieldDataDto[] | null;
    analytics?: SiteFormAnalyticDataDto[] | null;
  }): CreateSimpleEntityDto {
    const fieldValues: SimpleFieldValueDto[] = [];
    let name: string | undefined = entityType.isMain ? form.name : undefined;
    if (fields) {
      const formFields = form.pages.flatMap((p) => p.fields).filter((f) => f.entityTypeId === entityType.entityTypeId);
      for (const field of fields) {
        const formField = formFields.find((ff) => ff.id === field.id);
        if (formField?.type === SiteFormFieldType.EntityName) {
          name = field.value as string;
        } else if (formField?.type === SiteFormFieldType.EntityField) {
          if (formField?.fieldId) {
            fieldValues.push({ fieldId: formField?.fieldId, value: field.value });
          }
        }
      }
    }
    if (analytics) {
      for (const analytic of analytics) {
        fieldValues.push({ fieldCode: analytic.code, value: analytic.value });
      }
    }
    return {
      entityTypeId: entityType.entityTypeId,
      boardId: entityType.boardId,
      ownerId: form.responsibleId,
      name,
      fieldValues,
    };
  }

  private async createAppointment({
    form,
    user,
    entity,
    dto,
  }: {
    form: SiteForm;
    user: User;
    entity: Entity | undefined;
    dto: SiteFormDataDto;
  }) {
    const scheduleId = this.getFieldValue<number>({ form, fields: dto.fields, type: SiteFormFieldType.Schedule });
    const performerId = this.getFieldValue<number>({
      form,
      fields: dto.fields,
      type: SiteFormFieldType.SchedulePerformer,
    });
    const startTime = this.getFieldValue<string>({ form, fields: dto.fields, type: SiteFormFieldType.ScheduleTime });
    if (scheduleId && performerId && startTime) {
      const startDate = DateUtil.fromISOString(startTime);
      await this.appointmentService.create({
        accountId: form.accountId,
        user,
        dto: {
          scheduleId,
          performerId,
          title: entity?.name ?? form.name,
          startDate: startDate.toISOString(),
          status: ScheduleAppointmentStatus.NotConfirmed,
          entityId: entity?.id,
          checkIntersection: true,
          ownerId: entity?.responsibleUserId ?? form.responsibleId,
        },
        skipPermissionCheck: true,
      });
    }
  }

  private async getPublicPages({
    form,
    dto,
    timezone,
  }: {
    form: SiteForm;
    dto?: SiteFormDataDto;
    timezone?: string;
  }): Promise<PublicSiteFormPageDto[]> {
    const publicPages: PublicSiteFormPageDto[] = [];

    for (const formPage of form.pages) {
      publicPages.push({
        id: formPage.id,
        title: formPage.title,
        sortOrder: formPage.sortOrder,
        fields: formPage.fields
          ? await this.getPublicFields({ form, formFields: formPage.fields, dto, timezone })
          : undefined,
      });
    }

    return publicPages;
  }

  private async getPublicFields({
    form,
    formFields,
    dto,
    timezone,
  }: {
    form: SiteForm;
    formFields: SiteFormField[];
    dto?: SiteFormDataDto;
    timezone?: string;
  }): Promise<PublicSiteFormFieldDto[]> {
    return Promise.all(formFields.map((formField) => this.getPublicField({ form, formField, dto, timezone })));
  }

  private async getPublicField({
    form,
    formField,
    dto,
    timezone,
  }: {
    form: SiteForm;
    formField: SiteFormField;
    dto?: SiteFormDataDto;
    timezone?: string;
  }): Promise<PublicSiteFormFieldDto> {
    return {
      id: formField.id,
      label: formField.label,
      placeholder: formField.placeholder,
      type: formField.type,
      isRequired: formField.isRequired,
      sortOrder: formField.sortOrder,
      settings: await this.getPublicFieldSettings({ form, formField, dto, timezone }),
    };
  }

  private async getPublicFieldSettings({
    form,
    formField,
    dto,
    timezone,
  }: {
    form: SiteForm;
    formField: SiteFormField;
    dto?: SiteFormDataDto;
    timezone?: string;
  }) {
    switch (formField.type) {
      case SiteFormFieldType.EntityField:
        return this.getEntityFieldSettings(formField);
      case SiteFormFieldType.Schedule:
        return this.getScheduleSettings(form);
      case SiteFormFieldType.SchedulePerformer:
        return this.getSchedulePerformerSettings({ form, fields: dto.fields });
      case SiteFormFieldType.ScheduleDate:
        return this.getScheduleDateSettings({ form, fields: dto.fields, timezone });
      case SiteFormFieldType.ScheduleTime:
        return this.getScheduleTimeSettings({ form, fields: dto.fields });
      default:
        return null;
    }
  }

  private async getEntityFieldSettings(formField: SiteFormField): Promise<PublicSiteFormFieldEntityFieldDto | null> {
    const field = await this.fieldService.findOne(
      {
        accountId: formField.accountId,
        entityTypeId: formField.entityTypeId,
        id: formField.fieldId,
      },
      { expand: ['options'] },
    );

    const options = field?.options?.map((o) => ({
      id: o.id,
      label: o.label,
      color: o.color,
      sortOrder: o.sortOrder,
    }));

    return field
      ? { fieldType: field.type, isValidationRequired: formField.isValidationRequired, meta: formField.meta, options }
      : null;
  }

  private async getScheduleSettings(form: SiteForm): Promise<PublicSiteFormFieldScheduleDto | null> {
    const options = (
      (await Promise.all(
        form.scheduleLinks?.map(async (sl) => {
          const schedule = await this.scheduleService.findOne({
            filter: { accountId: form.accountId, scheduleId: sl.scheduleId },
          });
          return schedule ? { id: schedule.id, label: schedule.name } : undefined;
        }),
      )) ?? []
    ).filter(Boolean);

    return { options };
  }

  private getFieldData({
    form,
    fields,
    type,
  }: {
    form: SiteForm;
    fields: SiteFormFieldDataDto[] | undefined | null;
    type: SiteFormFieldType;
  }): SiteFormFieldDataDto | undefined {
    const field = form.pages.flatMap((p) => p.fields).find((f) => f.type === type);

    return field ? fields?.find((f) => f.id === field.id) : undefined;
  }
  private getFieldValue<T>(params: {
    form: SiteForm;
    fields: SiteFormFieldDataDto[] | undefined | null;
    type: SiteFormFieldType;
  }): T | undefined {
    const fieldData = this.getFieldData(params);

    return fieldData ? (fieldData.value as T) : undefined;
  }

  private async getSchedulePerformerSettings({
    form,
    fields,
  }: {
    form: SiteForm;
    fields: SiteFormFieldDataDto[] | undefined | null;
  }): Promise<PublicSiteFormFieldScheduleDto | null> {
    const scheduleId = this.getFieldValue<number>({ form, fields, type: SiteFormFieldType.Schedule });
    if (scheduleId) {
      const schedule = await this.scheduleService.findOne({ filter: { accountId: form.accountId, scheduleId } });
      if (schedule?.performers) {
        const options = (
          (await Promise.all(
            schedule.performers.map(async (performer) => {
              if (performer.userId) {
                const user = await this.userService.findOne({ accountId: form.accountId, id: performer.userId });
                return user ? { id: performer.id, label: user.fullName } : undefined;
              } else if (performer.departmentId) {
                const department = await this.departmentService.findOne({
                  accountId: form.accountId,
                  departmentId: performer.departmentId,
                });
                return department ? { id: performer.id, label: department.name } : undefined;
              } else {
                return undefined;
              }
            }),
          )) ?? []
        ).filter(Boolean);
        return { options };
      }
    }

    return { options: [] };
  }

  private async getScheduleDateSettings({
    form,
    fields,
    timezone,
  }: {
    form: SiteForm;
    fields: SiteFormFieldDataDto[] | undefined | null;
    timezone?: string;
  }): Promise<PublicSiteFormFieldScheduleDateDto | null> {
    const scheduleId = this.getFieldValue<number>({ form, fields, type: SiteFormFieldType.Schedule });
    const performerId = this.getFieldValue<number>({ form, fields, type: SiteFormFieldType.SchedulePerformer });
    const scheduleData = this.getFieldData({ form, fields, type: SiteFormFieldType.ScheduleDate });

    if (scheduleId && performerId && scheduleData?.min && scheduleData?.max) {
      const [minDate, maxDate] = [scheduleData.min, scheduleData.max].map((date) =>
        DateUtil.fromISOString(date as string),
      );

      const dates = await this.appointmentService.getAvailableDates({
        accountId: form.accountId,
        scheduleId,
        performerId,
        minDate,
        maxDate,
        daysLimit: form.scheduleLimitDays,
        timezone: timezone ?? 'UTC',
      });

      return { dates };
    }

    return { dates: [] };
  }

  private async getScheduleTimeSettings({
    form,
    fields,
  }: {
    form: SiteForm;
    fields: SiteFormFieldDataDto[] | undefined | null;
  }): Promise<PublicSiteFormFieldScheduleTimeDto | null> {
    const scheduleId = this.getFieldValue<number>({ form, fields, type: SiteFormFieldType.Schedule });
    const performerId = this.getFieldValue<number>({ form, fields, type: SiteFormFieldType.SchedulePerformer });
    const scheduleDataStr = this.getFieldValue<string>({ form, fields, type: SiteFormFieldType.ScheduleDate });
    if (scheduleId && performerId && scheduleDataStr) {
      const minDate = DateUtil.fromISOString(scheduleDataStr);
      const maxDate = DateUtil.sub(DateUtil.add(minDate, { days: 1 }), { seconds: 1 });
      const spots = await this.appointmentService.getAvailableSpots({
        accountId: form.accountId,
        scheduleId,
        performerId,
        minDate,
        maxDate,
        daysLimit: form.scheduleLimitDays,
      });

      return { spots: spots.map((spot) => ({ from: spot.from.toISOString(), to: spot.to.toISOString() })) };
    }

    return { spots: [] };
  }
}
