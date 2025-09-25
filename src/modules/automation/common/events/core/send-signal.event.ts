import { Signal } from '../../types';

export class SendSignalEvent {
  accountId: number;
  signal: Signal;

  constructor({ accountId, signal }: SendSignalEvent) {
    this.accountId = accountId;
    this.signal = signal;
  }
}
