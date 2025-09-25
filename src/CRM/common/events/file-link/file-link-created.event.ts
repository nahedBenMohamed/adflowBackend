import { FileLinkEvent } from './file-link.event';

export class FileLinkCreatedEvent extends FileLinkEvent {
  createdAt: string;

  constructor({ accountId, sourceType, sourceId, fileLinkId, createdAt }: FileLinkCreatedEvent) {
    super({ accountId, sourceType, sourceId, fileLinkId });

    this.createdAt = createdAt;
  }
}
