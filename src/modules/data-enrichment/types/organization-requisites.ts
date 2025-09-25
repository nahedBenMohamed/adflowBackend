import { OrganizationRequisitesDto } from '../dto';
import { OrgBranchType, OrgStatus, OrgType } from '../enums';
import { DadataOrgRequisites } from './dadata-org-requisites';
import { DadataSuggestion } from './dadata-suggestion';

export class OrganizationRequisites {
  value?: string | null;
  unrestrictedValue?: string | null;
  inn?: string | null;
  kpp?: string | null;
  ogrn?: string | null;
  type?: OrgType | null;
  name?: {
    full?: string | null;
    short?: string | null;
  } | null;
  fio?: {
    name?: string | null;
    surname?: string | null;
    patronymic?: string | null;
  } | null;
  management?: {
    name?: string | null;
    post?: string | null;
    startDate?: Date | null;
  } | null;
  branchCount?: number | null;
  branchType?: OrgBranchType | null;
  address?: {
    unrestrictedValue?: string | null;
  } | null;
  state?: {
    registrationDate?: Date | null;
    liquidationDate?: Date | null;
    status?: OrgStatus | null;
  } | null;
  okato?: string | null;
  oktmo?: string | null;
  okpo?: string | null;
  okogu?: string | null;
  okfs?: string | null;
  okved?: string | null;
  employeeCount?: number | null;
  founders?: string[] | null;
  managers?: string[] | null;
  capital?: string | null;
  licenses?: string[] | null;
  phones?: string[] | null;
  emails?: string[] | null;

  constructor(data: Omit<OrganizationRequisites, 'toDto'>) {
    this.value = data.value;
    this.unrestrictedValue = data.unrestrictedValue;
    this.inn = data.inn;
    this.kpp = data.kpp;
    this.ogrn = data.ogrn;
    this.type = data.type;
    this.name = data.name;
    this.fio = data.fio;
    this.management = data.management;
    this.branchCount = data.branchCount;
    this.branchType = data.branchType;
    this.address = data.address;
    this.state = data.state;
    this.okato = data.okato;
    this.oktmo = data.oktmo;
    this.okpo = data.okpo;
    this.okogu = data.okogu;
    this.okfs = data.okfs;
    this.okved = data.okved;
    this.employeeCount = data.employeeCount;
    this.founders = data.founders;
    this.managers = data.managers;
    this.capital = data.capital;
    this.licenses = data.licenses;
    this.phones = data.phones;
    this.emails = data.emails;
  }

  public static fromDadata(suggestion: DadataSuggestion<DadataOrgRequisites>): OrganizationRequisites {
    const { data } = suggestion;
    return new OrganizationRequisites({
      value: suggestion.value,
      unrestrictedValue: suggestion.unrestricted_value,
      inn: data?.inn,
      kpp: data?.kpp,
      ogrn: data?.ogrn,
      type: data?.type,
      name: data?.name ? { full: data.name.full_with_opf, short: data.name.short_with_opf } : undefined,
      fio: data?.fio
        ? {
            name: data.fio.name,
            surname: data.fio.surname,
            patronymic: data.fio.patronymic,
          }
        : undefined,
      management: data?.management
        ? {
            name: data.management.name,
            post: data.management.post,
            startDate: data.management.start_date ? new Date(data.management.start_date) : undefined,
          }
        : undefined,
      branchCount: data?.branch_count,
      branchType: data?.branch_type,
      address: data?.address ? { unrestrictedValue: data.address.unrestricted_value } : undefined,
      state: data?.state
        ? {
            registrationDate: data.state.liquidation_date ? new Date(data.state.liquidation_date) : undefined,
            liquidationDate: data.state.liquidation_date ? new Date(data.state.liquidation_date) : undefined,
            status: data.state.status,
          }
        : undefined,
      okato: data?.okato,
      oktmo: data?.oktmo,
      okpo: data?.okpo,
      okogu: data?.okogu,
      okfs: data?.okfs,
      okved: data?.okved,
      employeeCount: data?.employee_count,
      founders: data?.founders,
      managers: data?.managers,
      capital: data?.capital,
      licenses: data?.licenses,
      phones: data?.phones,
      emails: data?.emails,
    });
  }

  toDto(): OrganizationRequisitesDto {
    return {
      value: this.value,
      unrestrictedValue: this.unrestrictedValue,
      inn: this.inn,
      kpp: this.kpp,
      ogrn: this.ogrn,
      type: this.type,
      name: this.name,
      fio: this.fio,
      management: this.management
        ? {
            name: this.management.name,
            post: this.management.post,
            startDate: this.management.startDate?.toISOString(),
          }
        : undefined,
      branchCount: this.branchCount,
      branchType: this.branchType,
      address: this.address,
      state: this.state
        ? {
            registrationDate: this.state.registrationDate?.toISOString(),
            liquidationDate: this.state.liquidationDate?.toISOString(),
            status: this.state.status,
          }
        : undefined,
      okato: this.okato,
      oktmo: this.oktmo,
      okpo: this.okpo,
      okogu: this.okogu,
      okfs: this.okfs,
      okved: this.okved,
      employeeCount: this.employeeCount,
      founders: this.founders,
      managers: this.managers,
      capital: this.capital,
      licenses: this.licenses,
      phones: this.phones,
      emails: this.emails,
    };
  }
}
