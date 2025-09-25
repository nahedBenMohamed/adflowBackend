import { IInputVariables } from '@camunda8/sdk/dist/zeebe/types';

type SignalName = string | number;
export interface Signal {
  name: SignalName | SignalName[];
  variables?: IInputVariables;
}
