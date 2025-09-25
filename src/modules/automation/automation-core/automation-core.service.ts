import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { Camunda8 } from '@camunda8/sdk';
import { IOutputVariables, JSONDoc, ProcessMetadata } from '@camunda8/sdk/dist/zeebe/types';
import { ProcessDefinition } from '@camunda8/sdk/dist/operate/lib/OperateDto';

import { AutomationConfig } from '../config/automation.config';
import { AUTOMATION_JOB_HANDLER, AUTOMATION_WORKER, AutomationHandler, Message, Signal } from '../common';
import { AutomationJobHandler } from '../common';
import { ProcessDefinitionVersions } from './types';

@Injectable()
export class AutomationCoreService implements OnModuleInit {
  private readonly logger = new Logger(AutomationCoreService.name);
  private readonly camunda = new Camunda8();
  private readonly zeebe = this.camunda.getZeebeGrpcApiClient();
  private readonly operate = this.camunda.getOperateApiClient();

  constructor(
    private readonly configService: ConfigService,
    private readonly discoveryService: DiscoveryService,
  ) {}

  onModuleInit() {
    const config = this.configService.get<AutomationConfig>('automation');
    if (!config.jobDiscovery) return;

    const wrappers = this.discoveryService.getProviders();
    const handlers = wrappers
      .filter((wrapper) => wrapper.metatype && Reflect.getMetadata(AUTOMATION_WORKER, wrapper.metatype))
      .map((wrapper) => ({
        instance: wrapper.instance as AutomationJobHandler<unknown, unknown>,
        type: Reflect.getMetadata(AUTOMATION_WORKER, wrapper.metatype) as string,
      }));
    for (const handler of handlers) {
      this.createWorker(handler.type, handler.instance.handleJob.bind(handler.instance));
    }

    wrappers
      .filter((wrapper) => wrapper.instance)
      .forEach((wrapper) => {
        Object.getOwnPropertyNames(Object.getPrototypeOf(wrapper.instance)).forEach((method) => {
          try {
            const methodHandler = wrapper.instance[method];
            if (typeof methodHandler === 'function') {
              const metadata = Reflect.getMetadata(AUTOMATION_JOB_HANDLER, methodHandler) as string;
              if (metadata) {
                this.createWorker(metadata, methodHandler.bind(wrapper.instance));
              }
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            //skip all errors
          }
        });
      });
  }

  async listProcessDefinitions(): Promise<ProcessDefinitionVersions[]> {
    const size = 100;
    let total = 0;
    let searchAfter: unknown[] = undefined;
    const definitions: ProcessDefinition[] = [];
    do {
      const result = await this.operate.searchProcessDefinitions({
        sort: [{ field: 'bpmnProcessId', order: 'ASC' }],
        searchAfter,
        size,
      });
      definitions.push(...result.items);
      total = Number(result.total);
      searchAfter = result.sortValues;
    } while (definitions.length < total);
    const processes = definitions.reduce((acc, item) => {
      const existingProcess = acc.find((process) => process.bpmnProcessId === item.bpmnProcessId);

      if (existingProcess) {
        existingProcess.versions.push({ version: item.version, key: item.key });
      } else {
        acc.push({
          bpmnProcessId: item.bpmnProcessId,
          name: item.name,
          versions: [{ version: item.version, key: item.key }],
        });
      }

      return acc;
    }, [] as ProcessDefinitionVersions[]);

    return processes;
  }

  async deployProcess(name: string, process: Buffer): Promise<ProcessMetadata | null> {
    try {
      const deploy = await this.zeebe.deployResource({ name, process });
      return deploy.deployments[0].process;
    } catch (e) {
      this.logger.warn(`Deploy process error: ${e.toString()}`);
      return null;
    }
  }

  async deleteProcess(resourceKey: string): Promise<boolean> {
    try {
      await this.zeebe.deleteResource({ resourceKey });
      return true;
    } catch (e) {
      this.logger.warn(`Delete process error: ${e.toString()}`);
      return false;
    }
  }

  async sendMessage(message: Message) {
    this.zeebe.publishMessage({
      name: this.formatSignalName(message),
      correlationKey: message.correlationKey,
      variables: message.variables,
    });
  }

  async sendSignal(signal: Signal) {
    this.zeebe.broadcastSignal({ signalName: this.formatSignalName(signal), variables: signal.variables });
  }

  async startProcess<V extends JSONDoc>({ bpmnProcessId, variables }: { bpmnProcessId: string; variables: V }) {
    this.zeebe.createProcessInstance({ bpmnProcessId, variables });
  }

  private formatSignalName({ name }: Signal): string {
    return `${Array.isArray(name) ? name.join('|') : name}`;
  }

  private createWorker<InputVariables, OutputVariables>(
    type: string,
    handler: AutomationHandler<InputVariables, OutputVariables>,
  ) {
    this.zeebe.createWorker({
      taskType: type,
      taskHandler: async (job) => {
        this.logger.log(`Handling job of type '${job.type}' with data: ${JSON.stringify(job)}`);

        try {
          const result = await handler({ variables: job.variables as InputVariables });
          this.logger.log(`Handled job of type '${job.type}' with result: ${JSON.stringify(result)}`);

          return job.complete(result?.variables as IOutputVariables);
        } catch (e) {
          this.logger.error(`Worker '${type}' error`, (e as Error)?.stack);

          if (e instanceof Error) {
            return job.fail(e.message);
          }

          return job.fail(e.toString());
        }
      },
    });

    this.logger.log(`Worker for task type '${type}' created`);
  }
}
