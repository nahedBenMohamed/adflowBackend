import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { Entity } from '@/CRM/Model/Entity/Entity';

import { EntityInfoDto } from './dto';

@Injectable()
export class EntityInfoService {
  constructor(
    @InjectRepository(Entity)
    private readonly repository: Repository<Entity>,
    private readonly authService: AuthorizationService,
  ) {}

  async findMany({
    accountId,
    user,
    entityIds,
  }: {
    accountId: number;
    user?: User | null;
    entityIds: number[];
  }): Promise<EntityInfoDto[]> {
    const entities = await this.createQb({ accountId, entityId: entityIds }).getMany();

    const result = [];

    for (const entity of entities) {
      result.push(await this.getEntityInfo({ user, entity }));
    }

    return result;
  }

  async findOne({
    accountId,
    user,
    entityId,
  }: {
    accountId: number;
    user?: User | null;
    entityId: number;
  }): Promise<EntityInfoDto | null> {
    const entity = await this.createQb({ accountId, entityId }).getOne();

    return entity ? this.getEntityInfo({ user, entity }) : null;
  }

  async getEntityInfo({
    user,
    entity,
    access,
  }: {
    user?: User | null;
    entity: Entity;
    access?: boolean;
  }): Promise<EntityInfoDto> {
    const hasAccess =
      user && access === undefined
        ? await this.authService.check({ action: 'view', user, authorizable: entity })
        : access;

    return {
      id: entity.id,
      name: entity.name,
      entityTypeId: entity.entityTypeId,
      ownerId: entity.responsibleUserId,
      boardId: entity.boardId,
      stageId: entity.stageId,
      createdAt: entity.createdAt.toISOString(),
      closedAt: entity.closedAt?.toISOString() ?? null,
      hasAccess,
      copiedFrom: entity.copiedFrom,
      copiedCount: entity.copiedCount,
      participantIds: entity.participantIds,
      focused: entity.focused,
    };
  }

  private createQb({ accountId, entityId }: { accountId: number; entityId: number | number[] }) {
    const qb = this.repository.createQueryBuilder('entity').where('entity.accountId = :accountId', { accountId });

    if (Array.isArray(entityId)) {
      qb.andWhere('entity.id IN (:...entityId)', { entityId });
    } else {
      qb.andWhere('entity.id = :entityId', { entityId });
    }

    return qb;
  }
}
