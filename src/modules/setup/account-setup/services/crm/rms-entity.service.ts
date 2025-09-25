import { Injectable } from '@nestjs/common';

import { User } from '@/modules/iam/user/entities/user.entity';

import { EntityLinkService } from '@/CRM/entity-link/entity-link.service';
import { EntityService } from '@/CRM/Service/Entity/EntityService';
import { Entity } from '@/CRM/Model/Entity/Entity';

@Injectable()
export class RmsEntityService {
  constructor(
    private readonly entityService: EntityService,
    private readonly entityLinkService: EntityLinkService,
  ) {}

  public async copyEntities(
    rmsAccountId: number,
    accountId: number,
    usersMap: Map<number, User>,
    entityTypesMap: Map<number, number>,
    boardsMap: Map<number, number>,
    stagesMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const entitiesMap = new Map<number, number>();

    for (const [rmsEntityTypeId, entityTypeId] of entityTypesMap) {
      const rmsEntities = await this.entityService.findMany(rmsAccountId, { entityTypeId: rmsEntityTypeId });
      for (const rmsEntity of rmsEntities) {
        const entity = await this.entityService.save(
          new Entity(
            accountId,
            rmsEntity.name,
            entityTypeId,
            usersMap.get(rmsEntity.responsibleUserId).id,
            rmsEntity.boardId ? boardsMap.get(rmsEntity.boardId) : null,
            rmsEntity.stageId ? stagesMap.get(rmsEntity.stageId) : null,
            usersMap.get(rmsEntity.createdBy).id,
            rmsEntity.weight,
            rmsEntity.focused,
            rmsEntity.closedAt,
            rmsEntity.updatedAt,
            rmsEntity.createdAt,
            rmsEntity.participantIds ? rmsEntity.participantIds.map((id) => usersMap.get(id).id) : null,
            null,
            null,
          ),
        );
        entitiesMap.set(rmsEntity.id, entity.id);
      }
    }

    const linked: number[] = [];
    for (const [rmsEntityId, entityId] of entitiesMap) {
      const rmsAllLinks = await this.entityLinkService.findMany({ accountId: rmsAccountId, sourceId: rmsEntityId });
      const rmsLinks = rmsAllLinks.filter((l) => entitiesMap.has(l.targetId));
      for (const rmsLink of rmsLinks) {
        if (!linked.includes(rmsLink.targetId)) {
          await this.entityLinkService.create({
            accountId,
            sourceId: entityId,
            targetId: entitiesMap.get(rmsLink.targetId),
            sortOrder: rmsLink.sortOrder,
          });
        }
      }
      linked.push(rmsEntityId);
    }

    return entitiesMap;
  }
}
