export class TelephonyCallEvent {
  accountId: number;
  entityId: number | null;
  callId: number;

  constructor({ accountId, entityId, callId }: TelephonyCallEvent) {
    this.accountId = accountId;
    this.entityId = entityId;
    this.callId = callId;
  }
}
