import { Injectable } from '@nestjs/common';

import { User } from '@/modules/iam/user/entities/user.entity';

import { TaskService } from '@/CRM/task/task.service';
import { TaskSettingsService } from '@/CRM/task-settings/task-settings.service';
import { TaskSettingsType } from '@/CRM/task-settings/enums/task-settings-type.enum';
import { TaskSubtaskService } from '@/CRM/task-subtask/task-subtask.service';

@Injectable()
export class RmsTaskService {
  constructor(
    private readonly taskService: TaskService,
    private readonly taskSettingsService: TaskSettingsService,
    private readonly subtaskService: TaskSubtaskService,
  ) {}

  public async copyAll(
    rmsAccountId: number,
    accountId: number,
    usersMap: Map<number, User>,
    entityTypesMap: Map<number, number>,
    entitiesMap: Map<number, number>,
    boardsMap: Map<number, number>,
    stagesMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const taskSettingsMap = await this.copyTaskSettings(rmsAccountId, accountId, entityTypesMap, boardsMap);

    const tasksMap = await this.copyTasks(
      rmsAccountId,
      accountId,
      usersMap,
      boardsMap,
      stagesMap,
      entitiesMap,
      taskSettingsMap,
    );

    await this.copySubtasks(rmsAccountId, accountId, tasksMap);

    return tasksMap;
  }

  private async copyTaskSettings(
    rmsAccountId: number,
    accountId: number,
    entityTypesMap: Map<number, number>,
    boardsMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const taskSettingsMap = new Map<number, number>();

    const rmsTaskSettings = await this.taskSettingsService.findMany(rmsAccountId);
    for (const rmsTaskSetting of rmsTaskSettings) {
      const recordId = this.getRecordId(rmsTaskSetting.type, rmsTaskSetting.recordId, entityTypesMap, boardsMap);
      if (recordId) {
        const taskSetting = await this.taskSettingsService.create(accountId, {
          type: rmsTaskSetting.type,
          recordId: recordId,
          activeFields: rmsTaskSetting.activeFields,
        });
        taskSettingsMap.set(rmsTaskSetting.id, taskSetting.id);
      }
    }

    return taskSettingsMap;
  }

  private getRecordId(
    type: TaskSettingsType,
    recordId: number,
    entityTypesMap: Map<number, number>,
    boardsMap: Map<number, number>,
  ): number | null {
    if (type === TaskSettingsType.EntityType) {
      return entityTypesMap.get(recordId);
    }
    if (type === TaskSettingsType.TaskBoard) {
      return boardsMap.get(recordId);
    }
    return null;
  }

  private async copyTasks(
    rmsAccountId: number,
    accountId: number,
    usersMap: Map<number, User>,
    boardsMap: Map<number, number>,
    stagesMap: Map<number, number>,
    entitiesMap: Map<number, number>,
    taskSettingsMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const tasksMap = new Map<number, number>();

    const rmsTasks = await this.taskService.findMany({ accountId: rmsAccountId });
    for (const rmsTask of rmsTasks) {
      const stageId = rmsTask.stageId ? stagesMap.get(rmsTask.stageId) : null;
      if (rmsTask.stageId && !stageId) continue;

      const task = await this.taskService.create({
        accountId,
        user: usersMap.get(rmsTask.createdBy),
        dto: {
          responsibleUserId: usersMap.get(rmsTask.responsibleUserId).id,
          startDate: rmsTask.startDate ? rmsTask.startDate.toISOString() : null,
          endDate: rmsTask.endDate ? rmsTask.endDate.toISOString() : null,
          text: rmsTask.text,
          isResolved: rmsTask.isResolved,
          resolvedDate: rmsTask.resolvedDate ? rmsTask.resolvedDate.toISOString() : null,
          weight: rmsTask.weight,
          entityId: rmsTask.entityId ? entitiesMap.get(rmsTask.entityId) : null,
          title: rmsTask.title,
          plannedTime: rmsTask.plannedTime,
          boardId: rmsTask.boardId ? boardsMap.get(rmsTask.boardId) : null,
          stageId: stageId,
          settingsId: rmsTask.settingsId ? taskSettingsMap.get(rmsTask.settingsId) : null,
        },
      });

      tasksMap.set(rmsTask.id, task.id);
    }

    return tasksMap;
  }

  private async copySubtasks(rmsAccountId: number, accountId: number, tasksMap: Map<number, number>) {
    const rmsSubtasks = await this.subtaskService.findMany(rmsAccountId);

    for (const rmsSubtask of rmsSubtasks) {
      if (tasksMap.has(rmsSubtask.taskId)) {
        await this.subtaskService.create(accountId, tasksMap.get(rmsSubtask.taskId), {
          text: rmsSubtask.text,
          resolved: rmsSubtask.resolved,
        });
      }
    }
  }
}
