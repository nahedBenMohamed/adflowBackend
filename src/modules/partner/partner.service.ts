import { Injectable } from '@nestjs/common';

import { DateUtil } from '@/common';

import { AccountService } from '@/modules/iam/account/account.service';
import { AuthenticationService } from '@/modules/iam/authentication/authentication.service';
import { UserDto } from '@/modules/iam/user/dto/user.dto';
import { UserRole } from '@/modules/iam/common/enums/user-role.enum';
import { FieldType } from '@/modules/entity/entity-field/common/enums/field-type.enum';
import { Field } from '@/modules/entity/entity-field/field/entities/field.entity';
import { FieldService } from '@/modules/entity/entity-field/field/field.service';
import { FieldValueService } from '@/modules/entity/entity-field/field-value/field-value.service';
import { EntityCategory } from '@/CRM/common';
import { Entity } from '@/CRM/Model/Entity/Entity';
import { EntityTypeService } from '@/CRM/entity-type/entity-type.service';
import { EntityService } from '@/CRM/Service/Entity/EntityService';
import { EntityLinkService } from '@/CRM/entity-link/entity-link.service';
import { EntityTypeLinkService } from '@/CRM/entity-type-link/entity-type-link.service';

import { Partner, PartnerLead, PartnerSummary } from './types';

const PartnerEntityFields = {
  Password: 'Password',
  Ref: 'ref',
  Commission: 'Commission %',
};

const PartnerDealFields = {
  DateOfPayment: 'Date of payment',
  PaidToPartner: 'Paid to partner',
};

@Injectable()
export class PartnerService {
  constructor(
    private readonly accountService: AccountService,
    private readonly authService: AuthenticationService,
    private readonly entityTypeService: EntityTypeService,
    private readonly entityTypeLinkService: EntityTypeLinkService,
    private readonly entityService: EntityService,
    private readonly entityLinkService: EntityLinkService,
    private readonly fieldService: FieldService,
    private readonly fieldValueService: FieldValueService,
  ) {}

  public async login(subdomain: string, email: string, password: string) {
    const account = await this.accountService.findOne({ subdomain });

    if (account) {
      const partner = await this.findByFieldValue(account.id, { type: FieldType.Email }, email);

      if (partner && partner.password === password) {
        return this.authService.createJwtToken({
          accountId: account.id,
          subdomain: account.subdomain,
          userId: partner.id,
          isPartner: true,
        });
      }
    }

    return null;
  }

  public async getUser(accountId: number, partnerId: number): Promise<UserDto | null> {
    const partner = await this.createPartner(accountId, partnerId);

    return partner
      ? {
          id: partner.id,
          firstName: partner.name,
          lastName: null,
          email: partner.email,
          phone: partner.phone,
          role: UserRole.PARTNER,
          isActive: true,
          isPlatformAdmin: false,
        }
      : null;
  }

  public async linkLeadWithPartner(accountId: number, entityId: number, ref: string): Promise<void> {
    const partner = await this.findByFieldValue(
      accountId,
      { type: FieldType.Text, name: PartnerEntityFields.Ref },
      ref,
    );
    if (partner) {
      await this.entityLinkService.create({ accountId, sourceId: partner.id, targetId: entityId });
    }
  }

  public async getLeads(accountId: number, partnerId: number): Promise<PartnerLead[]> {
    const leads: PartnerLead[] = [];

    const entity = await this.entityService.findOne(accountId, { entityId: partnerId });
    const partner = await this.createPartner(accountId, entity);
    if (partner) {
      const entityTypeLinks = await this.entityTypeLinkService.findMany({ accountId, sourceId: entity.entityTypeId });
      for (const entityTypeLink of entityTypeLinks) {
        const entityType = await this.entityTypeService.findOne(accountId, { id: entityTypeLink.targetId });
        if (entityType?.entityCategory === EntityCategory.DEAL) {
          const dealFields = await this.fieldService.findMany({ accountId, entityTypeId: entityType.id });
          const entityLinks = await this.entityLinkService.findMany({ accountId, sourceId: partner.id });
          for (const entityLink of entityLinks) {
            const entity = await this.entityService.findOne(accountId, { entityId: entityLink.targetId });
            if (entity.entityTypeId === entityType.id) {
              leads.push(await this.createLead(accountId, entity, dealFields, partner.commission));
            }
          }
        }
      }
    }

    return leads.sort((l1, l2) => DateUtil.sort(l1.registrationDate, l2.registrationDate));
  }

  public async getSummary(accountId: number, partnerId: number): Promise<PartnerSummary | null> {
    const partner = await this.createPartner(accountId, partnerId);
    if (!partner) {
      return null;
    }

    const leads = await this.getLeads(accountId, partnerId);

    const payingLeads = leads.filter((lead) => lead.paymentDate !== null);
    const totalPayments = payingLeads
      .map((lead) => lead.paymentAmount)
      .reduce((total: number, currentValue: number) => total + currentValue, 0);
    const totalPartnerBonus = payingLeads
      .map((lead) => lead.partnerBonus)
      .reduce((total: number, currentValue: number) => total + currentValue, 0);

    return new PartnerSummary(
      partnerId,
      partner.name,
      leads.length,
      payingLeads.length,
      totalPayments,
      totalPartnerBonus,
    );
  }

  private async findByFieldValue(
    accountId: number,
    { type, name }: { type: FieldType; name?: string },
    value: string,
  ): Promise<Partner | null> {
    const entityTypes = await this.entityTypeService.findMany(accountId, { category: EntityCategory.PARTNER });
    for (const entityType of entityTypes) {
      const refField = await this.fieldService.findOne({ accountId, entityTypeId: entityType.id, type, name });
      if (refField) {
        const refFieldValue = await this.fieldValueService.findOne({ accountId, fieldId: refField.id, value });
        if (refFieldValue) {
          return this.createPartner(accountId, refFieldValue.entityId);
        }
      }
    }
    return null;
  }

  private async createPartner(accountId: number, entityOrId: Entity | number): Promise<Partner | null> {
    const entity =
      entityOrId instanceof Entity ? entityOrId : await this.entityService.findOne(accountId, { entityId: entityOrId });
    if (!entity) {
      return null;
    }

    const fields = await this.fieldService.findMany({ accountId, entityTypeId: entity.entityTypeId });
    const fieldValues = await this.fieldValueService.findMany({ accountId, entityId: entity.id });

    const emailField = fields.find((f) => f.type === FieldType.Email);
    const phoneField = fields.find((f) => f.type === FieldType.Phone);
    const passwordField = fields.find((f) => f.name.toLowerCase() === PartnerEntityFields.Password.toLowerCase());
    const refField = fields.find((f) => f.name.toLowerCase() === PartnerEntityFields.Ref.toLowerCase());
    const commissionField = fields.find((f) => f.name.toLowerCase() === PartnerEntityFields.Commission.toLowerCase());

    const emailFieldValue = emailField ? fieldValues.find((fv) => fv.fieldId === emailField.id) : null;
    const phoneFieldValue = phoneField ? fieldValues.find((fv) => fv.fieldId === phoneField.id) : null;
    const passwordFieldValue = passwordField ? fieldValues.find((fv) => fv.fieldId === passwordField.id) : null;
    const refFieldValue = refField ? fieldValues.find((fv) => fv.fieldId === refField.id) : null;
    const commissionFieldValue = commissionField ? fieldValues.find((fv) => fv.fieldId === commissionField.id) : null;

    const emails = emailFieldValue?.getValue<string[]>();
    const phones = phoneFieldValue?.getValue<string[]>();
    const password = passwordFieldValue?.getValue<string>();
    const ref = refFieldValue?.getValue<string>();
    const commission = commissionFieldValue?.getValue<number>() ?? 0;

    return emails && password
      ? new Partner(entity.id, entity.name, emails?.[0], phones?.[0], password, ref, commission)
      : null;
  }

  private async createLead(
    accountId: number,
    entity: Entity,
    fields: Field[],
    commission: number,
  ): Promise<PartnerLead> {
    const fieldValues = await this.fieldValueService.findMany({ accountId, entityId: entity.id });

    const paymentAmountField = fields.find((f) => f.type === FieldType.Value);
    const paymentDateField = fields.find((f) => f.name.toLowerCase() === PartnerDealFields.DateOfPayment.toLowerCase());
    const paidToPartnerField = fields.find(
      (f) => f.name.toLowerCase() === PartnerDealFields.PaidToPartner.toLowerCase(),
    );

    const paymentAmountFV = paymentAmountField ? fieldValues.find((fv) => fv.fieldId === paymentAmountField.id) : null;
    const paymentDateFV = paymentDateField ? fieldValues.find((fv) => fv.fieldId === paymentDateField.id) : null;
    const paidToPartnerFV = paidToPartnerField ? fieldValues.find((fv) => fv.fieldId === paidToPartnerField.id) : null;

    const paymentAmount = paymentAmountFV ? paymentAmountFV.getValue<number>() : 0;
    const paymentDate = paymentDateFV ? DateUtil.fromISOString(paymentDateFV.getValue<string>()) : null;
    const paidToPartner = paidToPartnerFV ? paidToPartnerFV.getValue<boolean>() : false;
    const partnerBonus = (paymentAmount / 100) * commission;

    return new PartnerLead(
      entity.id,
      entity.name,
      entity.createdAt,
      paymentDate,
      paymentAmount,
      partnerBonus,
      paidToPartner,
    );
  }
}
