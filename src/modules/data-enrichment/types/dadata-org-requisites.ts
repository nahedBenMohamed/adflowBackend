import { OrgBranchType, OrgStatus, OrgType } from '../enums';

export interface DadataOrgRequisites {
  inn?: string | null;
  kpp?: string | null;
  ogrn?: string | null;
  type?: OrgType | null;
  name?: {
    full_with_opf?: string | null;
    short_with_opf?: string | null;
  } | null;
  fio?: {
    name?: string | null;
    surname?: string | null;
    patronymic?: string | null;
  } | null;
  management?: {
    name?: string | null;
    post?: string | null;
    start_date?: number | null;
  } | null;
  branch_count?: number | null;
  branch_type?: OrgBranchType | null;
  address?: {
    unrestricted_value?: string | null;
  } | null;
  state?: {
    registration_date?: number | null;
    liquidation_date?: number | null;
    status?: OrgStatus | null;
  } | null;
  okato?: string | null;
  oktmo?: string | null;
  okpo?: string | null;
  okogu?: string | null;
  okfs?: string | null;
  okved?: string | null;
  employee_count?: number | null;
  founders?: string[] | null;
  managers?: string[] | null;
  capital?: string | null;
  licenses?: string[] | null;
  phones?: string[] | null;
  emails?: string[] | null;
}
