import { type FileLinkSource } from '@/common/enums';

export class FileLinkEvent {
  accountId: number;
  sourceType: FileLinkSource;
  sourceId: number | null;
  fileLinkId: number;

  constructor({ accountId, sourceType, sourceId, fileLinkId }: FileLinkEvent) {
    this.accountId = accountId;
    this.sourceType = sourceType;
    this.sourceId = sourceId;
    this.fileLinkId = fileLinkId;
  }
}
