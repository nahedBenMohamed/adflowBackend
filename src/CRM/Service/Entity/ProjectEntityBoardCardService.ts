import { Injectable } from '@nestjs/common';

import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { FieldCode } from '@/modules/entity/entity-field/field/enums/field-code.enum';
import { FieldService } from '@/modules/entity/entity-field/field/field.service';
import { FieldValueService } from '@/modules/entity/entity-field/field-value/field-value.service';

import { EntityCategory } from '../../common';

import { Entity } from '../../Model/Entity/Entity';
import { Task } from '../../task/entities';
import { TaskService } from '../../task/task.service';

import { EntityBoardCard } from './Dto/Board/EntityBoardCard';
import { ProjectEntityCard } from './Dto/Board/ProjectEntityCard';
import { TasksCount } from './Dto/Board/TasksCount';

@Injectable()
export class ProjectEntityBoardCardService {
  constructor(
    private readonly authService: AuthorizationService,
    private readonly fieldService: FieldService,
    private readonly fieldValueService: FieldValueService,
    private readonly taskService: TaskService,
  ) {}

  public async getBoardCards(
    accountId: number,
    user: User,
    entityTypeId: number,
    entities: Entity[],
    entityCategory: EntityCategory,
  ): Promise<EntityBoardCard[]> {
    const startDateField = await this.fieldService.findOne({ accountId, entityTypeId, code: FieldCode.StartDate });
    const endDateField = await this.fieldService.findOne({ accountId, entityTypeId, code: FieldCode.EndDate });

    const taskResponsibles = await this.authService.whoCanView({ user, authorizable: Task.getAuthorizable() });

    const cards = await Promise.all(
      entities.map(async (entity, idx) => {
        const card = await this.createBoardCard({
          accountId,
          user,
          entity,
          entityCategory,
          startDateFieldId: startDateField?.id,
          endDateFieldId: endDateField?.id,
          taskResponsibles,
        });
        return { idx, card };
      }),
    );

    return cards.sort((a, b) => a.idx - b.idx).map((c) => c.card);
  }

  public async getBoardCard(
    accountId: number,
    user: User,
    entity: Entity,
    entityCategory: EntityCategory,
  ): Promise<EntityBoardCard> {
    const startDateField = await this.fieldService.findOne({
      accountId,
      entityTypeId: entity.entityTypeId,
      code: FieldCode.StartDate,
    });
    const endDateField = await this.fieldService.findOne({
      accountId,
      entityTypeId: entity.entityTypeId,
      code: FieldCode.EndDate,
    });
    const taskResponsibles = await this.authService.whoCanView({ user, authorizable: Task.getAuthorizable() });

    return this.createBoardCard({
      accountId,
      user,
      entity,
      entityCategory,
      startDateFieldId: startDateField?.id,
      endDateFieldId: endDateField?.id,
      taskResponsibles,
    });
  }

  public async createBoardCard({
    accountId,
    user,
    entity,
    entityCategory,
    startDateFieldId,
    endDateFieldId,
    taskResponsibles,
  }: {
    accountId: number;
    user: User;
    entity: Entity;
    entityCategory: EntityCategory;
    startDateFieldId: number | null | undefined;
    endDateFieldId: number | null | undefined;
    taskResponsibles: number[] | undefined;
  }): Promise<EntityBoardCard> {
    const startDateFV = startDateFieldId
      ? await this.fieldValueService.findOne({ accountId, entityId: entity.id, fieldId: startDateFieldId })
      : null;
    const endDateFV = endDateFieldId
      ? await this.fieldValueService.findOne({ accountId, entityId: entity.id, fieldId: endDateFieldId })
      : null;

    const startDate = startDateFV ? startDateFV.getValue<string>() : null;
    const endDate = endDateFV ? endDateFV.getValue<string>() : null;

    const tasksCount = await this.getTasksCount({ accountId, entityId: entity.id, taskResponsibles });
    const userRights = await this.authService.getUserRights({ user, authorizable: entity });

    return new EntityBoardCard({
      id: entity.id,
      entityCategory,
      boardId: entity.boardId,
      stageId: entity.stageId,
      price: null,
      weight: entity.weight,
      focused: entity.focused,
      closedAt: entity.closedAt?.toISOString() ?? null,
      data: ProjectEntityCard.create(entity, startDate, endDate, tasksCount, userRights),
    });
  }

  private async getTasksCount({
    accountId,
    entityId,
    taskResponsibles,
  }: {
    accountId: number;
    entityId: number;
    taskResponsibles: number[] | undefined;
  }): Promise<TasksCount> {
    const tasks =
      !taskResponsibles || taskResponsibles.length
        ? await this.taskService.findMany({ accountId, entityId, responsibles: taskResponsibles })
        : [];

    const notResolved = tasks.filter((task) => !task.isResolved);
    const overdue = tasks.filter((task) => !task.isResolved && task.isTaskExpired());
    const today = tasks.filter((task) => !task.isResolved && task.isTaskToday());
    const resolved = tasks.filter((task) => task.isResolved);

    return new TasksCount(notResolved.length, overdue.length, today.length, resolved.length);
  }
}
