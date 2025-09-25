import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { capitalizeFirst, DateUtil } from '@/common';
import { ApplicationConfig } from '@/config';

import { AccountService } from '@/modules/iam/account/account.service';
import { Account } from '@/modules/iam/account/entities/account.entity';
import { AuthenticationService } from '@/modules/iam/authentication/authentication.service';
import { UserRole } from '@/modules/iam/common/enums/user-role.enum';
import { User } from '@/modules/iam/user/entities/user.entity';
import { UserService } from '@/modules/iam/user/user.service';
import { LoginLinkDto } from '@/modules/iam/authentication/dto/login-link.dto';
import { SubscriptionDiscountService } from '@/modules/iam/subscription-discount/subscription-discount.service';
import { FieldType } from '@/modules/entity/entity-field/common';
import { SimpleFieldValueDto } from '@/modules/entity/entity-field/field-value';
import { AppsumoService } from '@/modules/integration/appsumo';
import { PartnerService } from '@/modules/partner/partner.service';
import { CreateSimpleEntityDto } from '@/CRM/Service/Entity/Dto';
import { EntityService } from '@/CRM/Service/Entity/EntityService';
import { NoteService } from '@/CRM/note/note.service';

import { AccountSetupConfig } from './config';
import { RmsModules, RmsModulePrefix, DemoDataType } from '../common';
import { DemoDataService } from '../demo-data/demo-data.service';
import { RmsService } from '../rms/services/rms.service';

import { SetupAccountDto } from './dto';
import { SetupCrmService, SetupIAMService, SetupProductsService, SetupSchedulerService } from './services';

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
}
interface DealInfo {
  name: string;
  firstVisit?: Date | null;
}

const RMSDemoCode = 'demo';

const RestrictedFieldNames = ['password'];
const ExtraFieldNames = {
  promoCode: 'promoCode',
  rmsCode: 'rmsCode',
  rmsModules: 'rmsModules',
  ref: 'ref',
  appName: 'appName',
};

@Injectable()
export class AccountSetupService {
  private readonly logger = new Logger(AccountSetupService.name);
  private _config: AccountSetupConfig;
  private _appName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly accountService: AccountService,
    private readonly authService: AuthenticationService,
    private readonly userService: UserService,
    private readonly rmsService: RmsService,
    private readonly demoDataService: DemoDataService,
    private readonly setupCrmService: SetupCrmService,
    private readonly setupIAMService: SetupIAMService,
    private readonly setupProductsService: SetupProductsService,
    private readonly setupSchedulerService: SetupSchedulerService,
    private readonly appsumoService: AppsumoService,
    private readonly entityService: EntityService,
    private readonly noteService: NoteService,
    private readonly partnerService: PartnerService,
    private readonly discountService: SubscriptionDiscountService,
  ) {
    this._config = this.configService.get<AccountSetupConfig>('accountSetup');
    this._appName = this.configService.get<ApplicationConfig>('application').name;
  }

  async create(dto: SetupAccountDto, gaClientId?: string | null): Promise<LoginLinkDto> {
    const subscription = dto.appsumo ? await this.appsumoService.findSubscription(dto.appsumo) : undefined;

    const { account, owner } = await this.accountService.create(dto, {
      gaClientId,
      subscription,
      firstVisit: dto.firstVisit,
    });

    if (!dto.firstVisit) {
      dto.firstVisit = account.createdAt.toISOString();
    }

    await this.setupAccount(account, owner, dto.rmsCode, dto.rmsModules);

    await this.handleRegistrationEvent({ account, owner, dto });

    if (dto.appsumo) {
      await this.appsumoService.update(dto.appsumo, { accountId: account.id });
    }

    return this.authService.createLoginLink({ accountId: account.id, subdomain: account.subdomain, userId: owner.id });
  }

  private async setupAccount(account: Account, owner: User, rmsCode: string | null, modulesCode: string | null) {
    const modules = modulesCode ? this.parseModules(modulesCode) : undefined;

    const rms = await this.rmsService.findOne({ code: rmsCode || RMSDemoCode });
    if (rms && rms.accountId) {
      await this.setupRMS(account, owner, rms.accountId, modules);
    } else {
      await this.setupDefault(account.id, owner);
    }
  }

  private parseModules(modulesCode: string): RmsModules {
    const modules = new RmsModules();
    const moduleCodes = modulesCode.replace(/\s+/g, '').split(',');
    for (const moduleCode of moduleCodes) {
      const [prefix, code] = moduleCode.split('_');
      if (prefix && code) {
        const id = Number(code);
        if (prefix === RmsModulePrefix.EntityType) {
          if (!modules.entityTypeIds.includes(id)) {
            modules.entityTypeIds.push(id);
          }
        } else if (prefix === RmsModulePrefix.ProductSection) {
          if (!modules.productSectionIds.includes(id)) {
            modules.productSectionIds.push(id);
          }
        } else if (prefix === RmsModulePrefix.Scheduler) {
          if (!modules.schedulerIds.includes(id)) {
            modules.schedulerIds.push(id);
          }
        }
      }
    }
    return modules;
  }

  private async setupRMS(account: Account, owner: User, rmsAccountId: number, modules?: RmsModules) {
    const rmsAccount = await this.accountService.findOne({ accountId: rmsAccountId });

    const { rmsOwner, usersMap, departmentsMap } = await this.setupIAMService.copyAll(rmsAccount.id, account, owner);
    const demoUserIds = Array.from(usersMap.values())
      .filter((u) => u.id !== owner.id)
      .map((u) => u.id);
    if (demoUserIds.length > 0) {
      await this.demoDataService.create(account.id, DemoDataType.User, demoUserIds);
    }

    const { entityTypesMap, entitiesMap, tasksMap } = await this.setupCrmService.copyAll(
      rmsAccount.id,
      account.id,
      usersMap,
      modules?.entityTypeIds,
    );
    const demoEntityIds = Array.from(entitiesMap.values());
    if (demoEntityIds.length > 0) {
      await this.demoDataService.create(account.id, DemoDataType.Entity, demoEntityIds);
    }
    const demoTaskIds = Array.from(tasksMap.values());
    if (demoTaskIds.length > 0) {
      await this.demoDataService.create(account.id, DemoDataType.Task, demoTaskIds);
    }

    const { sectionsMap, productsMap, salesOrdersMap, rentalOrdersMap } = await this.setupProductsService.copyAll(
      rmsAccount,
      rmsOwner,
      account,
      owner,
      entityTypesMap,
      entitiesMap,
      modules?.productSectionIds,
    );
    const demoProductIds = Array.from(productsMap.values());
    if (demoProductIds.length > 0) {
      await this.demoDataService.create(account.id, DemoDataType.Product, demoProductIds);
    }
    const demoSaleOrderIds = Array.from(salesOrdersMap.values());
    if (demoSaleOrderIds.length > 0) {
      await this.demoDataService.create(account.id, DemoDataType.SalesOrder, demoSaleOrderIds);
    }
    const demoRentalOrderIds = Array.from(rentalOrdersMap.values());
    if (demoRentalOrderIds.length > 0) {
      await this.demoDataService.create(account.id, DemoDataType.RentalOrder, demoRentalOrderIds);
    }

    const { appointmentsMap } = await this.setupSchedulerService.copyAll(
      rmsAccount.id,
      account.id,
      owner,
      usersMap,
      departmentsMap,
      entityTypesMap,
      entitiesMap,
      sectionsMap,
      salesOrdersMap,
      modules?.schedulerIds,
    );
    const demoAppointmentIds = Array.from(appointmentsMap.values());
    if (demoAppointmentIds.length > 0) {
      await this.demoDataService.create(account.id, DemoDataType.ScheduleAppointment, demoAppointmentIds);
    }
  }

  private async setupDefault(accountId: number, owner: User) {
    await this.setupCrmService.setupDefault(accountId, owner);
  }

  private async handleRegistrationEvent({
    account,
    owner,
    dto,
  }: {
    account: Account;
    owner: User;
    dto: SetupAccountDto;
  }) {
    if (!this._config.accountId) return;

    try {
      const responsible = this._config.responsibleId
        ? await this.userService.findOne({ accountId: this._config.accountId, id: this._config.responsibleId })
        : await this.userService.findOne({ accountId: this._config.accountId, role: UserRole.OWNER });

      const extraParams = dto.extraUserInfo ? this.parseExtraParams(dto.extraUserInfo) : {};
      if (dto.promoCode) {
        extraParams[ExtraFieldNames.promoCode] = dto.promoCode;
      }
      if (dto.rmsCode) {
        extraParams[ExtraFieldNames.rmsCode] = dto.rmsCode;
      }
      if (dto.rmsModules) {
        extraParams[ExtraFieldNames.rmsModules] = dto.rmsModules;
      }
      if (dto.ref) {
        extraParams[ExtraFieldNames.ref] = dto.ref;
      }
      extraParams[ExtraFieldNames.appName] = this._appName;

      const deal = await this.createDealDto(
        {
          name: `Registration: ${account.companyName}`,
          firstVisit: dto.firstVisit ? DateUtil.fromISOString(dto.firstVisit) : undefined,
        },
        extraParams,
      );
      const contact = this.createContactDto(
        {
          name: `${owner.firstName} ${owner.lastName}`,
          phone: owner.phone,
          email: owner.email,
        },
        [deal],
      );

      const entities = await this.entityService.createSimple({
        accountId: this._config.accountId,
        user: responsible,
        dto: contact,
        options: { createdAt: account.createdAt, checkDuplicate: true },
      });

      await this.noteService.create({
        accountId: this._config.accountId,
        userId: responsible.id,
        entityId: entities[1].id,
        dto: { text: this.getCommentHtml({ account: account, registration: dto }) },
        options: { createdAt: account.createdAt },
      });

      if (dto.ref) {
        await this.partnerService.linkLeadWithPartner(this._config.accountId, entities[1].id, dto.ref);
      }
    } catch (e) {
      this.logger.error(`Error during lead creation in ${this._config.accountId} account`, (e as Error)?.stack);
    }
  }

  private parseExtraParams(extra: { analytics?: object }): Record<string, string> {
    if (!extra.analytics) return {};

    const extraParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(extra.analytics)) {
      if (value) {
        extraParams[key] = value;
      }
    }

    return extraParams;
  }

  private createContactDto(
    { name, phone, email }: ContactInfo,
    linkedEntities: CreateSimpleEntityDto[],
  ): CreateSimpleEntityDto {
    return {
      entityTypeId: this._config.contactId,
      name,
      fieldValues: [
        { fieldType: FieldType.Phone, value: phone },
        { fieldType: FieldType.Email, value: email },
      ],
      linkedEntities,
    };
  }
  private async createDealDto(
    { name, firstVisit }: DealInfo,
    extraParams?: Record<string, string>,
  ): Promise<CreateSimpleEntityDto> {
    const fieldValues: SimpleFieldValueDto[] = [];
    if (firstVisit) {
      const discounts = await this.discountService.findMany(firstVisit);
      discounts.forEach((discount) => {
        fieldValues.push({ fieldName: discount.code, value: discount.endAt });
      });
    }
    if (extraParams) {
      for (const key of Object.keys(extraParams)) {
        fieldValues.push({ fieldName: key, value: extraParams[key] });
      }
    }

    return {
      entityTypeId: this._config.dealId,
      boardId: this._config.dealBoardId,
      name,
      fieldValues,
    };
  }

  private getCommentHtml(obj: object): string {
    const comment: string[] = [];
    comment.push('<ul>');
    for (const key of Object.keys(obj)) {
      if (!RestrictedFieldNames.includes(key)) {
        const value = obj[key];
        if (value instanceof Object) {
          comment.push(`<li><b>${capitalizeFirst(key)}:</b>`);
          comment.push(this.getCommentHtml(value));
          comment.push('</li>');
        } else if (value !== null && value !== undefined) {
          comment.push(`<li><b>${capitalizeFirst(key)}:</b> ${value}</li>`);
        }
      }
    }
    comment.push('</ul>');
    return comment.join('');
  }
}
