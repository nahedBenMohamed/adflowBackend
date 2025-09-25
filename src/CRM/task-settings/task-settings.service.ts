import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateTaskSettingsDto, UpdateTaskSettingsDto } from './dto';
import { TaskSettings } from './entities';
import { TaskFieldCode, TaskSettingsType } from './enums';

@Injectable()
export class TaskSettingsService {
  constructor(
    @InjectRepository(TaskSettings)
    private readonly repository: Repository<TaskSettings>,
  ) {}

  public async create(accountId: number, dto: CreateTaskSettingsDto): Promise<TaskSettings> {
    return this.repository.save(TaskSettings.fromDto(accountId, dto));
  }

  public async findOne(accountId: number, settingsId: number): Promise<TaskSettings> {
    return await this.repository.findOne({ where: { accountId, id: settingsId } });
  }

  public async findMany(accountId: number): Promise<TaskSettings[]> {
    return await this.repository.find({ where: { accountId } });
  }

  public async setTaskSettingsForEntityType(
    accountId: number,
    entityTypeId: number,
    activeFields: TaskFieldCode[] | null,
  ) {
    if (activeFields) {
      await this.repository.delete({ accountId, type: TaskSettingsType.EntityType, recordId: entityTypeId });
      await this.create(accountId, { type: TaskSettingsType.EntityType, recordId: entityTypeId, activeFields });
    }
  }

  public async update(accountId: number, settingsId: number, dto: UpdateTaskSettingsDto): Promise<TaskSettings> {
    await this.repository.update({ accountId, id: settingsId }, { activeFields: dto.activeFields });

    return this.findOne(accountId, settingsId);
  }

  public async delete(accountId: number, recordId: number, type: TaskSettingsType): Promise<void> {
    await this.repository.delete({ accountId, recordId, type });
  }
}
