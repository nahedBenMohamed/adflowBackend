import { Injectable } from '@nestjs/common';

import { User } from '@/modules/iam/user/entities/user.entity';

import { ActivityService } from '@/CRM/activity/activity.service';
import { ActivityTypeService } from '@/CRM/activity-type/activity-type.service';

@Injectable()
export class RmsActivityService {
  constructor(
    private readonly activityService: ActivityService,
    private readonly activityTypeService: ActivityTypeService,
  ) {}

  public async setupDefault(accountId: number) {
    await Promise.all([
      this.activityTypeService.create({ accountId, dto: { name: 'Call' } }),
      this.activityTypeService.create({ accountId, dto: { name: 'Email' } }),
      this.activityTypeService.create({ accountId, dto: { name: 'Meeting' } }),
    ]);
  }

  public async copyAll(
    rmsAccountId: number,
    accountId: number,
    usersMap: Map<number, User>,
    entitiesMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const activityTypesMap = await this.copyActivityTypes(rmsAccountId, accountId);

    return await this.copyActivities(rmsAccountId, accountId, usersMap, entitiesMap, activityTypesMap);
  }

  public async copyActivityTypes(rmsAccountId: number, accountId: number) {
    const activityTypesMap = new Map<number, number>();

    const activityTypes = await this.activityTypeService.findMany({ accountId: rmsAccountId });
    for (const activityType of activityTypes) {
      const newActivityType = await this.activityTypeService.create({ accountId, dto: { name: activityType.name } });
      activityTypesMap.set(activityType.id, newActivityType.id);
    }

    return activityTypesMap;
  }

  public async copyActivities(
    rmsAccountId: number,
    accountId: number,
    usersMap: Map<number, User>,
    entitiesMap: Map<number, number>,
    activityTypesMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const activitiesMap = new Map<number, number>();

    const rmsActivities = await this.activityService.findMany({ accountId: rmsAccountId });
    for (const rmsActivity of rmsActivities) {
      if (entitiesMap.has(rmsActivity.entityId)) {
        const activity = await this.activityService.create(accountId, usersMap.get(rmsActivity.createdBy), {
          responsibleUserId: usersMap.get(rmsActivity.responsibleUserId).id,
          startDate: rmsActivity.startDate ? rmsActivity.startDate.toISOString() : null,
          endDate: rmsActivity.endDate ? rmsActivity.endDate.toISOString() : null,
          text: rmsActivity.text,
          entityId: entitiesMap.get(rmsActivity.entityId),
          activityTypeId: activityTypesMap.get(rmsActivity.activityTypeId),
          isResolved: rmsActivity.isResolved,
          resolvedDate: rmsActivity.resolvedDate ? rmsActivity.resolvedDate.toISOString() : null,
          result: rmsActivity.result,
          weight: rmsActivity.weight,
        });

        activitiesMap.set(rmsActivity.id, activity.id);
      }
    }

    return activitiesMap;
  }
}
