import { OpfType } from '../enums';

export interface DadataBankRequisites {
  bic?: string | null;
  swift?: string | null;
  inn?: string | null;
  kpp?: string | null;
  correspondent_account?: string | null;
  payment_city?: string | null;
  opf?: {
    type?: OpfType | null;
  };
}
