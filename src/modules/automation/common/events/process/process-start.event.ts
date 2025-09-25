import { JSONDoc } from '@camunda8/sdk/dist/zeebe/types';

export class ProcessStartEvent<V extends JSONDoc> {
  accountId: number;
  processId: number;
  variables: V;

  constructor({ accountId, processId, variables }: ProcessStartEvent<V>) {
    this.accountId = accountId;
    this.processId = processId;
    this.variables = variables;
  }
}
