import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { FileLinkSource } from '@/common';
import {
  ProductOrderCreatedEvent,
  ProductOrderEvent,
  ProductsEventType,
  RentalOrderCreatedEvent,
  RentalOrderEvent,
  ShipmentCreatedEvent,
  ShipmentDeletedEvent,
} from '@/modules/inventory/common';
import { TelephonyEventType, TelephonyCallCreatedEvent, TelephonyCallUpdatedEvent } from '@/modules/telephony/common';
import {
  ActivityCreatedEvent,
  ActivityEvent,
  CrmEventType,
  FileLinkCreatedEvent,
  FileLinkEvent,
  NoteCreatedEvent,
  NoteEvent,
  TaskCreatedEvent,
  TaskEvent,
  TaskUpdatedEvent,
} from '@/CRM/common';
import { MailEventType, MailMessageEvent } from '@/Mailing/common';

import { EntityEventType } from './enums';
import { EntityEventService } from './entity-event.service';

@Injectable()
export class EntityEventHandler {
  constructor(private readonly entityEventService: EntityEventService) {}

  @OnEvent(CrmEventType.ActivityCreated, { async: true })
  public async onActivityCreated(event: ActivityCreatedEvent) {
    if (event.entityId && event.activityId) {
      await this.entityEventService.create(event.accountId, {
        entityId: event.entityId,
        objectId: event.activityId,
        type: EntityEventType.Activity,
        createdAt: event.createdAt,
      });
    }
  }

  @OnEvent(CrmEventType.ActivityDeleted, { async: true })
  public async onActivityDeleted(event: ActivityEvent) {
    if (event.entityId && event.activityId) {
      await this.entityEventService.delete(event.accountId, {
        entityId: event.entityId,
        objectId: event.activityId,
        type: EntityEventType.Activity,
      });
    }
  }

  @OnEvent(CrmEventType.FileLinkCreated, { async: true })
  public async onFileLinkCreated(event: FileLinkCreatedEvent) {
    if (event.sourceId && event.fileLinkId && event.sourceType === FileLinkSource.ENTITY_DOCUMENT) {
      await this.entityEventService.create(event.accountId, {
        entityId: event.sourceId,
        objectId: event.fileLinkId,
        type: EntityEventType.Document,
        createdAt: event.createdAt,
      });
    }
  }

  @OnEvent(CrmEventType.FileLinkDeleted, { async: true })
  public async onFileLinkDeleted(event: FileLinkEvent) {
    if (event.sourceId && event.fileLinkId && event.sourceType === FileLinkSource.ENTITY_DOCUMENT) {
      await this.entityEventService.delete(event.accountId, {
        entityId: event.sourceId,
        objectId: event.fileLinkId,
        type: EntityEventType.Document,
      });
    }
  }

  @OnEvent(MailEventType.MailMessageReceived, { async: true })
  public async onMailMessageReceived(event: MailMessageEvent) {
    if (event.entityId && event.messageId) {
      await this.entityEventService.create(event.accountId, {
        entityId: event.entityId,
        objectId: event.messageId,
        type: EntityEventType.Mail,
        createdAt: event.messageDate,
      });
    }
  }

  @OnEvent(MailEventType.MailMessageLinked, { async: true })
  public async onMailMessageLinked(event: MailMessageEvent) {
    if (event.entityId && event.messageId) {
      await this.entityEventService.create(event.accountId, {
        entityId: event.entityId,
        objectId: event.messageId,
        type: EntityEventType.Mail,
        createdAt: event.messageDate,
      });
    }
  }

  @OnEvent(MailEventType.MailMessageDeleted, { async: true })
  public async onMailMessageDeleted(event: MailMessageEvent) {
    if (event.entityId && event.messageId) {
      await this.entityEventService.delete(event.accountId, {
        entityId: event.entityId,
        objectId: event.messageId,
        type: EntityEventType.Mail,
      });
    }
  }

  @OnEvent(CrmEventType.NoteCreated, { async: true })
  public async onNoteCreated(event: NoteCreatedEvent) {
    if (event.entityId && event.noteId) {
      await this.entityEventService.create(event.accountId, {
        entityId: event.entityId,
        objectId: event.noteId,
        type: EntityEventType.Note,
        createdAt: event.createdAt,
      });
    }
  }

  @OnEvent(CrmEventType.NoteDeleted, { async: true })
  public async onNoteDeleted(event: NoteEvent) {
    if (event.entityId && event.noteId) {
      await this.entityEventService.delete(event.accountId, {
        entityId: event.entityId,
        objectId: event.noteId,
        type: EntityEventType.Note,
      });
    }
  }

  @OnEvent(ProductsEventType.ProductOrderCreated, { async: true })
  public async onProductOrderCreated(event: ProductOrderCreatedEvent) {
    if (event.entityId && event.orderId) {
      await this.entityEventService.create(event.accountId, {
        entityId: event.entityId,
        objectId: event.orderId,
        type: EntityEventType.Order,
        createdAt: event.createdAt,
      });
    }
  }

  @OnEvent(ProductsEventType.ProductOrderDeleted, { async: true })
  public async onProductOrderDeleted(event: ProductOrderEvent) {
    if (event.entityId && event.orderId) {
      await this.entityEventService.delete(event.accountId, {
        entityId: event.entityId,
        objectId: event.orderId,
        type: EntityEventType.Order,
      });
    }
  }

  @OnEvent(ProductsEventType.RentalOrderCreated, { async: true })
  public async onProductRentalOrderCreated(event: RentalOrderCreatedEvent) {
    if (event.entityId && event.rentalOrderId) {
      await this.entityEventService.create(event.accountId, {
        entityId: event.entityId,
        objectId: event.rentalOrderId,
        type: EntityEventType.RentalOrder,
        createdAt: event.createdAt,
      });
    }
  }

  @OnEvent(ProductsEventType.RentalOrderDeleted, { async: true })
  public async onProductRentalOrderDeleted(event: RentalOrderEvent) {
    if (event.entityId && event.rentalOrderId) {
      await this.entityEventService.delete(event.accountId, {
        entityId: event.entityId,
        objectId: event.rentalOrderId,
        type: EntityEventType.RentalOrder,
      });
    }
  }

  @OnEvent(ProductsEventType.ShipmentCreated, { async: true })
  public async onShipmentCreated(event: ShipmentCreatedEvent) {
    if (event.entityId && event.shipmentId) {
      await this.entityEventService.create(event.accountId, {
        entityId: event.entityId,
        objectId: event.shipmentId,
        type: EntityEventType.Shipment,
        createdAt: event.createdAt,
      });
    }
  }

  @OnEvent(ProductsEventType.ShipmentDeleted, { async: true })
  public async onShipmentDeleted(event: ShipmentDeletedEvent) {
    if (event.entityId && event.shipmentId) {
      await this.entityEventService.delete(event.accountId, {
        entityId: event.entityId,
        objectId: event.shipmentId,
        type: EntityEventType.Shipment,
      });
    }
  }

  @OnEvent(CrmEventType.TaskCreated, { async: true })
  public async onTaskCreated(event: TaskCreatedEvent) {
    if (event.entityId && event.taskId) {
      await this.entityEventService.create(event.accountId, {
        entityId: event.entityId,
        objectId: event.taskId,
        type: EntityEventType.Task,
        createdAt: event.createdAt.toISOString(),
      });
    }
  }

  @OnEvent(CrmEventType.TaskUpdated, { async: true })
  public async onTaskUpdated(event: TaskUpdatedEvent) {
    if (event.entityId !== event.prevEntityId && event.taskId) {
      await this.entityEventService.update(event.accountId, {
        entityId: event.entityId,
        objectId: event.taskId,
        type: EntityEventType.Task,
        createdAt: event.createdAt.toISOString(),
        oldEntityId: event.prevEntityId,
      });
    }
  }

  @OnEvent(CrmEventType.TaskDeleted, { async: true })
  public async onTaskDeleted(event: TaskEvent) {
    if (event.entityId && event.taskId) {
      await this.entityEventService.delete(event.accountId, {
        entityId: event.entityId,
        objectId: event.taskId,
        type: EntityEventType.Task,
      });
    }
  }

  @OnEvent(TelephonyEventType.TelephonyCallCreated, { async: true })
  public async onTelephonyCallCreated(event: TelephonyCallCreatedEvent) {
    if (event.entityId && event.callId) {
      await this.entityEventService.create(event.accountId, {
        entityId: event.entityId,
        objectId: event.callId,
        type: EntityEventType.Call,
        createdAt: event.createdAt,
      });
    }
  }

  @OnEvent(TelephonyEventType.TelephonyCallUpdated, { async: true })
  public async onTelephonyCallUpdated(event: TelephonyCallUpdatedEvent) {
    if (event.entityId && event.callId) {
      await this.entityEventService.update(event.accountId, {
        entityId: event.entityId,
        objectId: event.callId,
        type: EntityEventType.Call,
        createdAt: event.createdAt,
        oldEntityId: event.oldEntityId,
      });
    }
  }
}
