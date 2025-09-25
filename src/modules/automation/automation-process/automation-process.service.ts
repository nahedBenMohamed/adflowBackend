import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JSONDoc } from '@camunda8/sdk/dist/zeebe/types';

import { NotFoundError } from '@/common';

import { AutomationProcessType, Message, Signal } from '../common';
import { AutomationCoreService } from '../automation-core';

import { CreateAutomationProcessDto, UpdateAutomationProcessDto } from './dto';
import { AutomationProcess } from './entities';
import { ReadonlyProcess } from './types';
import { AutomationProcessError } from './errors';

interface FindFilter {
  accountId: number;
  processId?: number;
  createdBy?: number;
  name?: string;
  type?: AutomationProcessType;
  objectId?: number;
  isReadonly?: boolean;
}

@Injectable()
export class AutomationProcessService {
  private readonly logger = new Logger(AutomationProcessService.name);
  constructor(
    @InjectRepository(AutomationProcess)
    private readonly repository: Repository<AutomationProcess>,
    private readonly coreService: AutomationCoreService,
  ) {}

  async create({
    accountId,
    userId,
    dto,
  }: {
    accountId: number;
    userId: number;
    dto: CreateAutomationProcessDto & ReadonlyProcess;
  }): Promise<AutomationProcess> {
    const process = await this.repository.save(AutomationProcess.fromDto({ accountId, userId, dto }));

    return dto.isActive ? this.activate(process) : process;
  }

  async findOne(filter: FindFilter): Promise<AutomationProcess | null> {
    return this.createQb(filter).addSelect('ap.bpmn_file', 'ap_bpmn_file').getOne();
  }

  async findMany(filter: FindFilter): Promise<AutomationProcess[]> {
    return this.createQb(filter).orderBy('ap.created_at').getMany();
  }

  async getCount(filter: FindFilter): Promise<number> {
    return this.createQb(filter).getCount();
  }

  async update({
    accountId,
    processId,
    dto,
  }: {
    accountId: number;
    processId: number;
    dto: UpdateAutomationProcessDto & ReadonlyProcess;
  }): Promise<AutomationProcess> {
    const process = await this.findOne({ accountId, processId });
    if (process.isReadonly) {
      throw new BadRequestException('AutomationProcess is readonly');
    }
    if (!process) {
      throw NotFoundError.withId(AutomationProcess, processId);
    }

    const wasActive = process.isActive;
    if (process.isActive) {
      await this.deactivate(process);
    }
    this.repository.save(process.update(dto));

    if (dto.isActive || (dto.isActive === undefined && wasActive)) {
      await this.activate(process);
    }

    return process;
  }

  async changeOwner({
    accountId,
    currentUserId,
    newUserId,
  }: {
    accountId: number;
    currentUserId: number;
    newUserId: number;
  }) {
    await this.repository.update({ accountId, createdBy: currentUserId }, { createdBy: newUserId });
  }

  async deleteMany(filter: FindFilter) {
    const processes = await this.findMany(filter);
    for (const process of processes) {
      await this.delete({ accountId: process.accountId, processId: process.id });
    }
  }

  async delete({ accountId, processId }: { accountId: number; processId: number }): Promise<number> {
    const process = await this.findOne({ accountId, processId });
    if (!process) {
      throw NotFoundError.withId(AutomationProcess, processId);
    }

    if (process.isActive) {
      await this.deactivate(process);
    }

    await this.repository.delete(process.id);
    return process.id;
  }

  async cleanUnused() {
    const processes = await this.coreService.listProcessDefinitions();
    for (const process of processes) {
      const localProcess = await this.repository.findOneBy({ bpmnProcessId: process.bpmnProcessId });
      const versions = [...process.versions].sort((a, b) => a.version - b.version);
      if (localProcess) {
        versions.pop();
      }
      for (const version of versions) {
        const deleted = await this.coreService.deleteProcess(version.key);
        this.logger.debug(
          // eslint-disable-next-line max-len
          `Clean bpmnProcessId: ${process.bpmnProcessId}, version: ${version.version}, key: ${version.key}. Result: ${deleted}`,
        );
      }
    }
  }

  async cleanUnlinked(): Promise<number> {
    const processes = await this.repository
      .createQueryBuilder('ap')
      .leftJoin('automation_entity_type', 'aet', 'aet.process_id = ap.id')
      .where('ap.is_readonly = true')
      .andWhere('ap.resource_key is not null')
      .andWhere('aet.id is null')
      .getMany();

    let count = 0;
    for (const process of processes) {
      const deleted = await this.coreService.deleteProcess(process.resourceKey);
      if (deleted) {
        await this.repository.delete(process.id);
        count++;
      }
      this.logger.debug(
        `Clean bpmnProcessId: ${process.bpmnProcessId}, key: ${process.resourceKey}. Result: ${deleted}`,
      );
    }

    return count;
  }

  async sendMessage({ accountId, message }: { accountId: number; message: Message }) {
    if ((await this.getCount({ accountId })) > 0) {
      this.coreService.sendMessage(message);
    }
  }

  async sendSignal({ accountId, signal }: { accountId: number; signal: Signal }) {
    if ((await this.getCount({ accountId })) > 0) {
      this.coreService.sendSignal(signal);
    }
  }

  async processStart<V extends JSONDoc>({
    accountId,
    processId,
    variables,
  }: {
    accountId: number;
    processId: number;
    variables: V;
  }) {
    const process = await this.findOne({ accountId, processId });
    if (process?.bpmnProcessId) {
      this.coreService.startProcess({ bpmnProcessId: process.bpmnProcessId, variables });
    }
  }

  private createQb(filter: FindFilter) {
    const qb = this.repository
      .createQueryBuilder('ap')
      .where('ap.account_id = :accountId', { accountId: filter.accountId });

    if (filter.processId) {
      qb.andWhere('ap.id = :id', { id: filter.processId });
    }
    if (filter.createdBy) {
      qb.andWhere('ap.created_by = :createdBy', { createdBy: filter.createdBy });
    }
    if (filter.name) {
      qb.andWhere('ap.name ilike :name', { name: `%${filter.name}%` });
    }
    if (filter.type) {
      qb.andWhere('ap.type = :type', { type: filter.type });
    }
    if (filter.objectId) {
      qb.andWhere('ap.object_id = :objectId', { objectId: filter.objectId });
    }
    if (filter.isReadonly !== undefined) {
      qb.andWhere('ap.is_readonly = :isReadonly', { isReadonly: filter.isReadonly });
    }

    return qb;
  }

  private async activate(process: AutomationProcess): Promise<AutomationProcess> {
    if (process.bpmnFile === null) {
      throw new AutomationProcessError({ processId: process.id });
    }
    const processMeta = await this.coreService.deployProcess(
      `[${process.accountId}]_${process.id}.bpmn`,
      Buffer.from(process.bpmnFile),
    );

    if (processMeta) {
      await this.repository.save(
        process.update({ resourceKey: processMeta.processDefinitionKey, bpmnProcessId: processMeta.bpmnProcessId }),
      );
      return process;
    } else {
      throw new AutomationProcessError({ processId: process.id });
    }
  }

  private async deactivate(process: AutomationProcess): Promise<AutomationProcess> {
    const deleted = await this.coreService.deleteProcess(process.resourceKey);

    if (deleted) {
      await this.repository.save(process.update({ resourceKey: null, bpmnProcessId: null }));
      return process;
    } else {
      throw new AutomationProcessError({ processId: process.id });
    }
  }
}
