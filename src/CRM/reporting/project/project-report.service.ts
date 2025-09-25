import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { DatePeriod, ForbiddenError, intersection, NumberUtil } from '@/common';
import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities';
import { FieldType } from '@/modules/entity/entity-field/common/enums/field-type.enum';
import { FieldService } from '@/modules/entity/entity-field/field/field.service';

import { BoardService } from '../../board/board.service';
import { BoardStageService } from '../../board-stage/board-stage.service';
import { EntityType } from '../../entity-type/entities';
import { Entity } from '../../Model/Entity/Entity';
import { EntityService } from '../../Service/Entity/EntityService';
import { Task } from '../../task/entities';

import { ProjectEntitiesReportFilterDto, ProjectTaskUserReportFilterDto } from './dto';
import {
  ProjectEntitiesReport,
  ProjectEntitiesReportMeta,
  ProjectEntitiesReportRow,
  ProjectReportField,
  ProjectReportFieldMeta,
  ProjectReportItem,
  ProjectStageItem,
  ProjectTaskUserReport,
  ProjectTaskUserReportRow,
  ProjectTaskUserReportTotalRow,
} from './types';

interface Filter {
  userIds?: number[];
  projectStageIds?: number[];
  taskUserIds?: number[];
  taskBoardStageIds?: number[];
  period?: DatePeriod;
}

@Injectable()
export class ProjectReportService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Entity)
    private readonly entityRepository: Repository<Entity>,
    private readonly authService: AuthorizationService,
    private readonly boardService: BoardService,
    private readonly stageService: BoardStageService,
    private readonly entityService: EntityService,
    private readonly fieldService: FieldService,
  ) {}

  public async getEntitiesReport({
    accountId,
    user,
    filter,
  }: {
    accountId: number;
    user: User;
    filter: ProjectEntitiesReportFilterDto;
  }): Promise<ProjectEntitiesReport> {
    const { entityTypeId, boardId, taskBoardStageIds } = filter;
    const { allow, userIds: allowedUserIds } = await this.authService.getPermissions({
      action: 'report',
      user,
      authorizable: EntityType.getAuthorizable(entityTypeId),
    });
    if (!allow) {
      throw new ForbiddenError();
    }
    const userIds = filter.ownerIds?.length ? intersection(filter.ownerIds, allowedUserIds) : allowedUserIds;

    const period = filter.period ? DatePeriod.fromFilter(filter.period) : undefined;
    const fieldsMeta = await this.getFieldsMeta({ accountId, entityTypeId: entityTypeId });
    const projectStageIds = await this.stageService.findManyIds({ accountId, boardId });
    const stageIds = await this.getTaskBoardStageIds({ accountId, boardId, taskBoardStageIds });
    const groupFilter: Filter = { userIds, projectStageIds, taskBoardStageIds: stageIds, period };

    const rows = await this.getEntitiesGroupBy({ accountId, isTotal: false, filter: groupFilter, fieldsMeta });
    const [total] = await this.getEntitiesGroupBy({ accountId, isTotal: true, filter: groupFilter, fieldsMeta });

    return new ProjectEntitiesReport(rows, total, new ProjectEntitiesReportMeta({ fields: fieldsMeta }));
  }

  public async getTaskUserReport({
    accountId,
    user,
    filter,
  }: {
    accountId: number;
    user: User;
    filter: ProjectTaskUserReportFilterDto;
  }): Promise<ProjectTaskUserReport> {
    const { entityId, boardId, taskBoardStageIds } = filter;
    const entity = await this.entityService.findOne(accountId, { entityId });
    const { allow, userIds: allowedUserIds } = await this.authService.getPermissions({
      action: 'report',
      user,
      authorizable: entity,
    });
    if (!allow) {
      throw new ForbiddenError();
    }
    const userIds = filter.taskUserIds?.length ? intersection(filter.taskUserIds, allowedUserIds) : allowedUserIds;

    const period = filter.period ? DatePeriod.fromFilter(filter.period) : undefined;
    const stageIds = await this.getTaskBoardStageIds({ accountId, boardId, taskBoardStageIds });

    const taskFilter: Filter = { taskUserIds: userIds, taskBoardStageIds: stageIds, period };

    const taskUserQb = this.getTaskUserReportQb(accountId, entityId, false, taskFilter);
    const taskUserRawData = await taskUserQb.getRawMany();
    let taskUserReportRows: ProjectTaskUserReportRow[] = [];
    if (taskUserRawData.length > 0) {
      taskUserReportRows = taskUserRawData.map(
        (d) =>
          new ProjectTaskUserReportRow(
            d?.user_id,
            new ProjectReportItem(d?.opened?.task_count, d?.opened?.planned_time),
            new ProjectReportItem(d?.done?.task_count, d?.done?.planned_time),
            new ProjectReportItem(d?.overdue?.task_count, d?.overdue?.planned_time),
            stageIds.map(
              (id) => new ProjectStageItem(id, new ProjectReportItem(d[id]['task_count'], d[id]['planned_time'])),
            ),
            d?.total_planned_time,
            +d?.completion_percent,
          ),
      );
    }

    const totalTaskUserQb = this.getTaskUserReportQb(accountId, entityId, true, taskFilter);
    const totalTaskUserRawData = await totalTaskUserQb.getRawOne();
    let taskUserReportTotalRow = ProjectTaskUserReportTotalRow.empty();
    if (totalTaskUserRawData !== undefined) {
      taskUserReportTotalRow = new ProjectTaskUserReportTotalRow(
        new ProjectReportItem(totalTaskUserRawData?.opened?.task_count, totalTaskUserRawData?.opened?.planned_time),
        new ProjectReportItem(totalTaskUserRawData?.done?.task_count, totalTaskUserRawData?.done?.planned_time),
        new ProjectReportItem(totalTaskUserRawData?.overdue?.task_count, totalTaskUserRawData?.overdue?.planned_time),
        taskBoardStageIds.map(
          (id) =>
            new ProjectStageItem(
              id,
              new ProjectReportItem(totalTaskUserRawData[id]['task_count'], totalTaskUserRawData[id]['planned_time']),
            ),
        ),
        totalTaskUserRawData?.total_planned_time,
        +totalTaskUserRawData?.completion_percent,
      );
    }
    return new ProjectTaskUserReport(taskUserReportRows, taskUserReportTotalRow);
  }

  private async getEntitiesGroupBy({
    accountId,
    isTotal,
    filter,
    fieldsMeta,
  }: {
    accountId: number;
    isTotal: boolean;
    filter: Filter;
    fieldsMeta: ProjectReportFieldMeta[];
  }): Promise<ProjectEntitiesReportRow[]> {
    const rowArray: ProjectEntitiesReportRow[] = [];
    const fieldRows = await this.getFieldsReportQb(accountId, isTotal, filter, fieldsMeta).getRawMany();
    const rows = await this.getEntitiesReportQb(accountId, isTotal, filter).getRawMany();
    for (const row of rows) {
      const ownerId = row.entity_id || 0;
      const fieldRow = fieldRows.find((r) => r.entity_id === ownerId);
      const fields: ProjectReportField[] = [];
      if (fieldRow) {
        for (const fieldMeta of fieldsMeta) {
          const value = NumberUtil.toNumber(fieldRow[`fv_${fieldMeta.fieldId}_amount`]);
          if (value) {
            fields.push(new ProjectReportField(fieldMeta.fieldId, fieldMeta.fieldName, value));
          }
        }
      }
      rowArray.push(
        new ProjectEntitiesReportRow(
          ownerId,
          row.entity_name || '',
          new ProjectReportItem(row.all?.task_count, row.all?.planned_time),
          new ProjectReportItem(row.done?.task_count, row.done?.planned_time),
          new ProjectReportItem(row.overdue?.task_count, row.overdue?.planned_time),
          filter.taskBoardStageIds.map(
            (id) => new ProjectStageItem(id, new ProjectReportItem(row[id]['task_count'], row[id]['planned_time'])),
          ),
          row.project_stage_id || null,
          row.completion_percent,
          fields,
        ),
      );
    }

    return rowArray;
  }

  private async getFieldsMeta({
    accountId,
    entityTypeId,
  }: {
    accountId: number;
    entityTypeId: number;
  }): Promise<ProjectReportFieldMeta[]> {
    const fieldsMeta: ProjectReportFieldMeta[] = [];

    const formulaFields = await this.fieldService.findMany({ accountId, entityTypeId, type: FieldType.Formula });
    for (const field of formulaFields) {
      fieldsMeta.push(new ProjectReportFieldMeta(field.id, field.name));
    }

    return fieldsMeta;
  }

  private async getTaskBoardStageIds({
    accountId,
    boardId,
    taskBoardStageIds,
  }: {
    accountId: number;
    boardId: number;
    taskBoardStageIds?: number[];
  }) {
    const board = await this.boardService.findOne({ filter: { accountId, boardId } });
    const stageIds = board.taskBoardId
      ? await this.stageService.findManyIds({ accountId, boardId: board.taskBoardId })
      : [];

    return taskBoardStageIds?.length ? stageIds.filter((s) => taskBoardStageIds.includes(s)) : stageIds;
  }

  private getEntitiesReportQb(accountId: number, isTotal: boolean, filter: Filter) {
    const qb = this.entityRepository
      .createQueryBuilder('entity')
      .where('entity.account_id = :accountId', { accountId })
      .andWhere('entity.stage_id in (:...stageIds)', { stageIds: filter?.projectStageIds });

    if (filter.userIds?.length) {
      qb.andWhere(`entity.responsible_user_id in (:...ownerIds)`, { ownerIds: filter.userIds });
    }

    if (isTotal) {
      qb.select('0::integer', 'entity_id');
    } else {
      qb.select('entity.id', 'entity_id')
        .addSelect('entity.stage_id', 'project_stage_id')
        .addSelect('entity.name', 'entity_name')
        .groupBy('entity.id')
        .addGroupBy('entity.name');
    }
    qb.leftJoin(Task, 'task', 'task.entity_id = entity.id').addSelect(
      "json_build_object('task_count', count(task.id), 'planned_time', coalesce(sum(task.planned_time), 0))",
      'all',
    );
    this.specifyBaseFieldsQb(qb, filter);

    return qb;
  }

  private getFieldsReportQb(accountId: number, isTotal: boolean, filter: Filter, fieldsMeta: ProjectReportFieldMeta[]) {
    const qb = this.entityRepository
      .createQueryBuilder('entity')
      .where('entity.account_id = :accountId', { accountId })
      .andWhere('entity.stage_id in (:...stageIds)', { stageIds: filter?.projectStageIds });

    if (filter.userIds?.length) {
      qb.andWhere(`entity.responsible_user_id in (:...ownerIds)`, { ownerIds: filter.userIds });
    }
    if (isTotal) {
      qb.select('0::integer', 'entity_id');
    } else {
      qb.select('entity.id', 'entity_id').groupBy('entity.id');
    }

    for (const fieldMeta of fieldsMeta) {
      const fieldKey = `fv_${fieldMeta.fieldId}`;
      qb.leftJoin(
        // eslint-disable-next-line max-len
        `(select entity_id, sum(cast(payload::json->>'value' as decimal)) as amount from field_value where field_id = ${fieldMeta.fieldId} group by entity_id)`,
        fieldKey,
        `${fieldKey}.entity_id = entity.id`,
      ).addSelect(`sum(${fieldKey}.amount)`, `${fieldKey}_amount`);
    }

    return qb;
  }

  private getTaskUserReportQb(accountId: number, entityId: number, isTotal: boolean, filter: Filter) {
    const qb = this.taskRepository.createQueryBuilder('task');
    if (isTotal) {
      qb.select('task.entity_id', 'entity_id').groupBy('task.entity_id');
    } else {
      qb.select('task.responsible_user_id', 'user_id').groupBy('task.responsible_user_id');
    }
    this.specifyBaseFieldsQb(qb, filter);
    qb.addSelect('coalesce(sum(task.planned_time), 0)::integer', 'total_planned_time')
      .addSelect(
        'json_build_object(' +
          "'task_count', count(task.id) filter (where task.is_resolved=false), " +
          "'planned_time', coalesce(sum(task.planned_time) filter (where task.is_resolved=false), 0))",
        'opened',
      )
      .andWhere('task.account_id = :accountId', { accountId })
      .andWhere('task.entity_id = :entityId', { entityId: entityId });

    if (filter.taskUserIds?.length) {
      qb.andWhere('task.responsible_user_id in (:...userIds)', { userIds: filter.taskUserIds });
    }
    return qb;
  }

  private specifyBaseFieldsQb<T>(qb: SelectQueryBuilder<T>, filter: Filter) {
    qb.addSelect(
      'json_build_object(' +
        "'task_count', count(task.id) filter (where task.is_resolved=true), " +
        "'planned_time', coalesce(sum(task.planned_time) filter (where task.is_resolved=true), 0))",
      'done',
    )
      .addSelect(
        'json_build_object(' +
          "'task_count', count(task.id) filter (where task.end_date < now() and task.is_resolved=false), " +
          // eslint-disable-next-line max-len
          "'planned_time', coalesce(sum(task.planned_time) filter (where task.end_date < now() and task.is_resolved=false), 0))",
        'overdue',
      )
      .addSelect(
        'coalesce(count(task.id) filter (where task.is_resolved = true)::float / nullif(count(task.id), 0), 0)::float',
        'completion_percent',
      );

    if (filter.taskBoardStageIds?.length) {
      for (const stageId of filter.taskBoardStageIds) {
        qb.addSelect(
          `json_build_object('task_count', count(task.id) filter (where task.stage_id = ${stageId}), ` +
            `'planned_time', coalesce(sum(task.planned_time) filter (where task.stage_id = ${stageId}), 0))`,
          `${stageId}`,
        );
      }
    }

    if (filter.period?.from) {
      qb.andWhere('task.created_at >= :from', { from: filter.period.from });
    }
    if (filter.period?.to) {
      qb.andWhere('task.created_at <= :to', { to: filter.period.to });
    }
  }
}
