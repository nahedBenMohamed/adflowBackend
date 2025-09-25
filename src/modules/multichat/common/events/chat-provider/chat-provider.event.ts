import { ChatProviderStatus } from '../../enums';

export class ChatProviderEvent {
  accountId: number;
  userId: number;
  providerId: number;
  status?: ChatProviderStatus;

  constructor({ accountId, userId, providerId, status }: ChatProviderEvent) {
    this.accountId = accountId;
    this.userId = userId;
    this.providerId = providerId;
    this.status = status;
  }
}
