interface ProcessDefinitionVersion {
  version: number;
  key: string;
}

export interface ProcessDefinitionVersions {
  bpmnProcessId: string;
  name: string;
  versions: ProcessDefinitionVersion[];
}
