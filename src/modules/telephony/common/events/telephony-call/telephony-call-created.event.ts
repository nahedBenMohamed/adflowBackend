import { TelephonyCallEvent } from './telephony-call.event';

export class TelephonyCallCreatedEvent extends TelephonyCallEvent {
  createdAt: string;

  constructor({ accountId, entityId, callId, createdAt }: TelephonyCallCreatedEvent) {
    super({ accountId, entityId, callId });

    this.createdAt = createdAt;
  }
}
