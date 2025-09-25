export enum OrgStatus {
  // Действующая
  Active = 'ACTIVE',
  // Ликвидируется
  Liquidating = 'LIQUIDATING',
  // Ликвидирована
  Liquidated = 'LIQUIDATED',
  // Банкротство
  Bankrupt = 'BANKRUPT',
  // В процессе присоединения к другому юрлицу, с последующей ликвидацией
  Reorganizing = 'REORGANIZING',
}
