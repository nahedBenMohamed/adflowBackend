import { IInputVariables, IOutputVariables } from '@camunda8/sdk/dist/zeebe/types';

export interface AutomationJob<Variables = IInputVariables> {
  variables: Variables;
}

export interface AutomationResult<Variables = IOutputVariables> {
  variables: Variables;
}

export type AutomationHandler<InputVariables, OutputVariables> = (
  job: AutomationJob<InputVariables>,
) => AutomationResult<OutputVariables> | Promise<AutomationResult<OutputVariables>>;

export interface AutomationJobHandler<InputVariables, OutputVariables> {
  handleJob: AutomationHandler<InputVariables, OutputVariables>;
}
