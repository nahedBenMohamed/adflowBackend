import { BankRequisitesDto } from '../dto';
import { OpfType } from '../enums';
import { DadataBankRequisites } from './dadata-bank-requisites';
import { DadataSuggestion } from './dadata-suggestion';

export class BankRequisites {
  value?: string | null;
  unrestrictedValue?: string | null;
  bic?: string | null;
  swift?: string | null;
  inn?: string | null;
  kpp?: string | null;
  correspondentAccount?: string | null;
  paymentCity?: string | null;
  opf?: OpfType | null;

  constructor(data: Omit<BankRequisites, 'toDto'>) {
    this.value = data.value;
    this.unrestrictedValue = data.unrestrictedValue;
    this.bic = data.bic;
    this.swift = data.swift;
    this.inn = data.inn;
    this.kpp = data.kpp;
    this.correspondentAccount = data.correspondentAccount;
    this.paymentCity = data.paymentCity;
    this.opf = data.opf;
  }

  public static fromDadata(suggestion: DadataSuggestion<DadataBankRequisites>): BankRequisites {
    return new BankRequisites({
      value: suggestion.value,
      unrestrictedValue: suggestion.unrestricted_value,
      bic: suggestion.data?.bic,
      swift: suggestion.data?.swift,
      inn: suggestion.data?.inn,
      kpp: suggestion.data?.kpp,
      correspondentAccount: suggestion.data?.correspondent_account,
      paymentCity: suggestion.data?.payment_city,
      opf: suggestion.data?.opf?.type,
    });
  }

  toDto(): BankRequisitesDto {
    return {
      value: this.value,
      unrestrictedValue: this.unrestrictedValue,
      bic: this.bic,
      swift: this.swift,
      inn: this.inn,
      kpp: this.kpp,
      correspondentAccount: this.correspondentAccount,
      paymentCity: this.paymentCity,
      opf: this.opf,
    };
  }
}
