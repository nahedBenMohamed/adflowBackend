import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { IamEventType, UserDeletedEvent } from '@/modules/iam/common';
import { ProductsEventType, ProductsSectionEvent } from '@/modules/inventory/common';
import { ScheduleEvent, SchedulerEventType } from '@/modules/scheduler/common';
import { CrmEventType, EntityTypeEvent } from '@/CRM/common';

import { TutorialProductType } from '../common';
import { TutorialItemService } from './tutorial-item.service';

@Injectable()
export class TutorialItemHandler {
  constructor(private readonly service: TutorialItemService) {}

  @OnEvent(IamEventType.UserDeleted, { async: true })
  public async onUserDeleted(event: UserDeletedEvent) {
    await this.service.deleteUser(event.accountId, event.userId);
  }

  @OnEvent(CrmEventType.EntityTypeDeleted, { async: true })
  public async onEntityTypeDeleted(event: EntityTypeEvent) {
    await this.service.deleteProduct(event.accountId, TutorialProductType.ENTITY_TYPE, event.entityTypeId);
  }

  @OnEvent(ProductsEventType.ProductsSectionDeleted, { async: true })
  public async onProductsSectionDeleted(event: ProductsSectionEvent) {
    await this.service.deleteProduct(event.accountId, TutorialProductType.PRODUCTS_SECTION, event.sectionId);
  }

  @OnEvent(SchedulerEventType.ScheduleDeleted, { async: true })
  public async onScheduleDeleted(event: ScheduleEvent) {
    await this.service.deleteProduct(event.accountId, TutorialProductType.SCHEDULER, event.scheduleId);
  }
}
