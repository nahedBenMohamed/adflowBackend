import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { FieldService } from '../field/field.service';

import { FieldAccess } from './enums';
import { FieldSettings } from './types';
import { UpdateFieldSettingsDto } from './dto';
import { FieldStageSettings, FieldUserSettings } from './entities';

const cacheKeyStage = ({ accountId, fieldId }: { accountId: number; fieldId: number }) =>
  `FieldStageSettings:${accountId}:${fieldId}`;
const cacheKeyUser = ({ accountId, fieldId }: { accountId: number; fieldId: number }) =>
  `FieldUserSettings:${accountId}:${fieldId}`;

@Injectable()
export class FieldSettingsService {
  constructor(
    @InjectRepository(FieldStageSettings)
    private readonly repositoryStageSettings: Repository<FieldStageSettings>,
    @InjectRepository(FieldUserSettings)
    private readonly repositoryUserSettings: Repository<FieldUserSettings>,
    private readonly dataSource: DataSource,
    private readonly fieldService: FieldService,
  ) {}

  public async findOne({ accountId, fieldId }: { accountId: number; fieldId: number }): Promise<FieldSettings> {
    const stageSettings = await this.repositoryStageSettings.find({
      where: { accountId, fieldId },
      cache: { id: cacheKeyStage({ accountId, fieldId }), milliseconds: 600000 },
    });

    const userSettings = await this.repositoryUserSettings.find({
      where: { accountId, fieldId },
      cache: { id: cacheKeyUser({ accountId, fieldId }), milliseconds: 600000 },
    });

    return new FieldSettings(
      fieldId,
      stageSettings.filter((s) => s.access === FieldAccess.IMPORTANT).map((s) => s.stageId),
      stageSettings.filter((s) => s.access === FieldAccess.REQUIRED).map((s) => s.stageId),
      stageSettings.filter((s) => s.access === FieldAccess.REQUIRED)?.[0]?.excludeUserIds ?? [],
      stageSettings.filter((s) => s.access === FieldAccess.HIDDEN).map((s) => s.stageId),
      userSettings.filter((u) => u.access === FieldAccess.READONLY).map((u) => u.userId),
      userSettings.filter((u) => u.access === FieldAccess.HIDDEN).map((u) => u.userId),
    );
  }

  public async findMany({
    accountId,
    entityTypeId,
  }: {
    accountId: number;
    entityTypeId?: number;
  }): Promise<FieldSettings[]> {
    const filedIds = await this.fieldService.findManyIds({ accountId, entityTypeId });

    return Promise.all(filedIds.map((fieldId) => this.findOne({ accountId, fieldId })));
  }

  public async getRestrictedFields({
    accountId,
    entityTypeId,
    access,
    userId,
    stageId,
  }: {
    accountId: number;
    entityTypeId: number;
    access: FieldAccess;
    userId?: number;
    stageId?: number;
  }): Promise<number[]> {
    const fieldIds = await this.fieldService.findManyIds({ accountId, entityTypeId });

    const result: number[] = [];
    for (const fieldId of fieldIds) {
      const settings = await this.findOne({ accountId, fieldId });
      if (stageId) {
        switch (access) {
          case FieldAccess.IMPORTANT:
            if (settings.importantStageIds?.includes(stageId)) {
              result.push(fieldId);
            }
            break;
          case FieldAccess.REQUIRED:
            if (
              settings.requiredStageIds?.includes(stageId) &&
              (!userId || (userId && !settings.excludeUserIds?.includes(userId)))
            ) {
              result.push(fieldId);
            }
            break;
          case FieldAccess.HIDDEN:
            if (settings.hideStageIds?.includes(stageId)) {
              result.push(fieldId);
            }
            break;
        }
      }
      if (userId) {
        switch (access) {
          case FieldAccess.READONLY:
            if (settings.readonlyUserIds?.includes(userId)) {
              result.push(fieldId);
            }
            break;
          case FieldAccess.HIDDEN:
            if (settings.hideUserIds?.includes(userId)) {
              result.push(fieldId);
            }
            break;
        }
      }
    }

    return result;
  }

  public async update({
    accountId,
    fieldId,
    dto,
  }: {
    accountId: number;
    fieldId: number;
    dto: UpdateFieldSettingsDto;
  }): Promise<FieldSettings> {
    await this.repositoryStageSettings.delete({ accountId, fieldId });
    await this.repositoryUserSettings.delete({ accountId, fieldId });
    this.dataSource.queryResultCache?.remove([
      cacheKeyStage({ accountId, fieldId }),
      cacheKeyUser({ accountId, fieldId }),
    ]);

    if (dto.importantStageIds) {
      await this.repositoryStageSettings.insert(
        dto.importantStageIds.map((stageId) => ({ accountId, fieldId, stageId, access: FieldAccess.IMPORTANT })),
      );
    }
    if (dto.requiredStageIds) {
      await this.repositoryStageSettings.insert(
        dto.requiredStageIds.map((stageId) => ({
          accountId,
          fieldId,
          stageId,
          access: FieldAccess.REQUIRED,
          excludeUserIds: dto.excludeUserIds,
        })),
      );
    }
    if (dto.hideStageIds) {
      await this.repositoryStageSettings.insert(
        dto.hideStageIds.map((stageId) => ({ accountId, fieldId, stageId, access: FieldAccess.HIDDEN })),
      );
    }

    if (dto.readonlyUserIds) {
      await this.repositoryUserSettings.insert(
        dto.readonlyUserIds.map((userId) => ({ accountId, fieldId, userId, access: FieldAccess.READONLY })),
      );
    }
    if (dto.hideUserIds) {
      await this.repositoryUserSettings.insert(
        dto.hideUserIds.map((userId) => ({ accountId, fieldId, userId, access: FieldAccess.HIDDEN })),
      );
    }

    return this.findOne({ accountId, fieldId });
  }
}
