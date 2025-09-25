import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { NotFoundError, PasswordUtil } from '@/common';

import { SiteFormConsentService } from '../../site-form-consent';
import { SiteFormGratitudeService } from '../../site-form-gratitude';
import { SiteFormPageService } from '../../site-form-page';

import type { CreateSiteFormDto, UpdateSiteFormDto } from '../dto';
import { SiteForm } from '../entities';
import type { ExpandableField } from '../types';
import { SiteFormEntityTypeService } from './site-form-entity-type.service';
import { SiteFormScheduleService } from './site-form-schedule.service';

interface FindFilter {
  formId?: number;
  code?: string;
}
interface FindOptions {
  expand?: ExpandableField[];
}

@Injectable()
export class SiteFormService {
  constructor(
    @InjectRepository(SiteForm)
    private readonly repository: Repository<SiteForm>,
    private readonly consentService: SiteFormConsentService,
    private readonly gratitudeService: SiteFormGratitudeService,
    private readonly pageService: SiteFormPageService,
    private readonly entityTypeLinkService: SiteFormEntityTypeService,
    private readonly scheduleLinkService: SiteFormScheduleService,
  ) {}

  async create(accountId: number, userId: number, dto: CreateSiteFormDto): Promise<SiteForm> {
    const code = PasswordUtil.generateSecure({ length: 16, numbers: true });
    const form = await this.repository.save(SiteForm.fromDto(accountId, userId, code, dto));

    if (dto.consent) {
      form.consent = await this.consentService.create(accountId, form.id, dto.consent);
    }

    if (dto.gratitude) {
      form.gratitude = await this.gratitudeService.create(accountId, form.id, dto.gratitude);
    }

    if (dto.pages) {
      form.pages = await this.pageService.createMany(accountId, form.id, dto.pages);
    }

    if (dto.entityTypeLinks) {
      form.entityTypeLinks = await this.entityTypeLinkService.createMany(accountId, form.id, dto.entityTypeLinks);
    }

    if (dto.scheduleLinks) {
      form.scheduleLinks = await this.scheduleLinkService.createMany(accountId, form.id, dto.scheduleLinks);
    }

    return form;
  }

  async findOne(accountId: number, filter?: FindFilter, options?: FindOptions): Promise<SiteForm | null> {
    const form = await this.createFindQb(accountId, filter).getOne();

    return form && options?.expand ? this.expandOne(form, options.expand) : form;
  }

  async findMany(accountId: number, filter?: FindFilter, options?: FindOptions): Promise<SiteForm[]> {
    const forms = await this.createFindQb(accountId, filter).orderBy('sf.id').getMany();

    return forms && options?.expand ? this.expandMany(forms, options.expand) : forms;
  }

  async findByCode(code: string, options?: FindOptions): Promise<SiteForm | null> {
    const form = await this.repository.findOneBy({ code, isActive: true });

    return form && options?.expand ? this.expandOne(form, options.expand) : form;
  }

  async update(accountId: number, formId: number, dto: UpdateSiteFormDto): Promise<SiteForm> {
    const form = await this.findOne(accountId, { formId });
    if (!form) {
      throw NotFoundError.withId(SiteForm, formId);
    }

    await this.repository.save(form.update(dto));

    if (dto.consent) {
      form.consent = await this.consentService.process(accountId, formId, dto.consent);
    }

    if (dto.gratitude) {
      form.gratitude = await this.gratitudeService.process(accountId, formId, dto.gratitude);
    }

    if (dto.pages) {
      form.pages = await this.pageService.processBatch(accountId, formId, dto.pages);
    }

    if (dto.entityTypeLinks) {
      form.entityTypeLinks = await this.entityTypeLinkService.processBatch(accountId, formId, dto.entityTypeLinks);
    }

    if (dto.scheduleLinks) {
      form.scheduleLinks = await this.scheduleLinkService.processBatch(accountId, form.id, dto.scheduleLinks);
    }

    return form;
  }

  async delete(accountId: number, formId: number): Promise<void> {
    await this.repository.delete({ accountId, id: formId });
  }

  private createFindQb(accountId: number, filter?: FindFilter) {
    const qb = this.repository.createQueryBuilder('sf').where('sf.account_id = :accountId', { accountId });

    if (filter?.formId) {
      qb.andWhere('sf.id = :id', { id: filter.formId });
    }
    if (filter?.code) {
      qb.andWhere('sf.code = :code', { code: filter.code });
    }

    return qb;
  }

  private async expandOne(form: SiteForm, expand: ExpandableField[]): Promise<SiteForm> {
    if (expand.includes('consent')) {
      form.consent = await this.consentService.findOne(form.accountId, { formId: form.id });
    }
    if (expand.includes('gratitude')) {
      form.gratitude = await this.gratitudeService.findOne(form.accountId, { formId: form.id });
    }
    if (expand.includes('pages.fields')) {
      form.pages = await this.pageService.findMany(form.accountId, { formId: form.id }, { expand: ['fields'] });
    } else if (expand.includes('pages')) {
      form.pages = await this.pageService.findMany(form.accountId, { formId: form.id });
    }
    if (expand.includes('entityTypeLinks')) {
      form.entityTypeLinks = await this.entityTypeLinkService.findMany(form.accountId, { formId: form.id });
    }
    if (expand.includes('scheduleLinks')) {
      form.scheduleLinks = await this.scheduleLinkService.findMany(form.accountId, { formId: form.id });
    }
    return form;
  }
  private async expandMany(forms: SiteForm[], expand: ExpandableField[]): Promise<SiteForm[]> {
    return await Promise.all(forms.map((form) => this.expandOne(form, expand)));
  }
}
