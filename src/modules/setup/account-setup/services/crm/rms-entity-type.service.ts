import { Injectable } from '@nestjs/common';

import { EntityType } from '@/CRM/entity-type/entities/entity-type.entity';
import { EntityTypeService } from '@/CRM/entity-type/entity-type.service';
import { EntityTypeLinkService } from '@/CRM/entity-type-link/entity-type-link.service';
import { EntityTypeFeatureService } from '@/CRM/feature/entity-type-feature.service';

@Injectable()
export class RmsEntityTypeService {
  constructor(
    private readonly entityTypeService: EntityTypeService,
    private readonly entityTypeLinkService: EntityTypeLinkService,
    private readonly entityTypeFeatureService: EntityTypeFeatureService,
  ) {}

  public async copyEntityTypes(
    rmsAccountId: number,
    accountId: number,
    entityTypeIds?: number[],
  ): Promise<Map<number, number>> {
    const typeMap = new Map<number, number>();
    const allTypes = await this.entityTypeService.findMany(rmsAccountId);
    const types = entityTypeIds ? allTypes.filter((t) => entityTypeIds.includes(t.id)) : allTypes;
    for (const type of types) {
      const et = await this.entityTypeService.save(EntityType.copy(accountId, type));
      typeMap.set(type.id, et.id);
    }

    for (const type of types) {
      const newEntityTypeId = typeMap.get(type.id);

      const allLinks = await this.entityTypeLinkService.findMany({ accountId: rmsAccountId, sourceId: type.id });
      const links = allLinks.filter((l) => typeMap.has(l.targetId));
      for (const link of links) {
        await this.entityTypeLinkService.create({
          accountId,
          sourceId: newEntityTypeId,
          dto: { targetId: typeMap.get(link.targetId), sortOrder: link.sortOrder },
          createBackLink: false,
        });
      }

      const features = await this.entityTypeFeatureService.findByEntityTypeId(rmsAccountId, type.id);
      const featureIds = features.map((f) => f.featureId);
      await this.entityTypeFeatureService.setEntityTypeFeatures(accountId, newEntityTypeId, featureIds);
    }

    return typeMap;
  }
}
