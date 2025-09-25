export class EntityImportEvent {
  accountId: number;
  userId: number;
  fileName: string;
  entityTypeId: number;
  entityTypeName: string | null;
  totalCount: number;

  constructor({ accountId, userId, fileName, entityTypeId, entityTypeName, totalCount }: EntityImportEvent) {
    this.accountId = accountId;
    this.userId = userId;
    this.fileName = fileName;
    this.entityTypeId = entityTypeId;
    this.entityTypeName = entityTypeName;
    this.totalCount = totalCount;
  }
}
