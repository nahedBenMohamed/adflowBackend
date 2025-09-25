import { TelephonyCallEvent } from './telephony-call.event';

export class TelephonyCallUpdatedEvent extends TelephonyCallEvent {
  createdAt: string;
  oldEntityId: number | null;

  constructor({ accountId, entityId, callId, createdAt, oldEntityId }: TelephonyCallUpdatedEvent) {
    super({ accountId, entityId, callId });

    this.createdAt = createdAt;
    this.oldEntityId = oldEntityId;
  }
}
