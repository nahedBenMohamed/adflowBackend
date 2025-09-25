export class ProductsSectionEvent {
  accountId: number;
  sectionId: number;

  constructor({ accountId, sectionId }: ProductsSectionEvent) {
    this.accountId = accountId;
    this.sectionId = sectionId;
  }
}
