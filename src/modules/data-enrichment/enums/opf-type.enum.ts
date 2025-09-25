export enum OpfType {
  // банк
  Bank = 'BANK',
  // филиал банка
  BankBranch = 'BANK_BRANCH',
  // небанковская кредитная организация (НКО)
  Nko = 'NKO',
  // филиал НКО
  NkoBranch = 'NKO_BRANCH',
  // расчетно-кассовый центр
  Rkc = 'RKC',
  // управление ЦБ РФ (март 2021)
  Cbr = 'CBR',
  // управление Казначейства (март 2021)
  Treasury = 'TREASURY',
  // другой
  Other = 'OTHER',
}
