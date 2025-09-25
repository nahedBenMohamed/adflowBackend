import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';

import { PagingQuery, PagingMeta } from '@/common';

import { Account } from '@/modules/iam/account/entities/account.entity';
import { User } from '@/modules/iam/user/entities/user.entity';
import { OrderService } from '@/modules/inventory/order/services/order.service';
import { RentalOrderService } from '@/modules/inventory/rental-order/services/rental-order.service';
import { ShipmentService } from '@/modules/inventory/shipment/shipment.service';
import { VoximplantCallService } from '@/modules/telephony/voximplant/voximplant-call/voximplant-call.service';

import { EntityLinkService } from '@/CRM/entity-link/entity-link.service';
import { FileLinkService } from '@/CRM/Service/FileLink/FileLinkService';
import { MailMessageService } from '@/Mailing/Service/MailMessage/MailMessageService';
import { ActivityService } from '@/CRM/activity/activity.service';
import { NoteService } from '@/CRM/note/note.service';
import { TaskService } from '@/CRM/task/task.service';

import {
  CreateEntityEventDto,
  GetEntityEventResult,
  EntityEventDataDto,
  UpdateEntityEventDto,
  DeleteEntityEventDto,
  EntityEventItemDto,
} from './dto';
import { EntityEvent } from './entities';
import { EntityEventType, EntityEventFilter } from './enums';

const ExcludeEventTypes = [EntityEventType.Order, EntityEventType.RentalOrder, EntityEventType.Shipment];

@Injectable()
export class EntityEventService {
  constructor(
    @InjectRepository(EntityEvent)
    private readonly repository: Repository<EntityEvent>,
    private readonly activityService: ActivityService,
    private readonly entityLinkService: EntityLinkService,
    private readonly fileLinkService: FileLinkService,
    private readonly mailMessageService: MailMessageService,
    private readonly noteService: NoteService,
    private readonly orderService: OrderService,
    private readonly rentalOrderService: RentalOrderService,
    private readonly shipmentService: ShipmentService,
    private readonly taskService: TaskService,
    private readonly telephonyCallService: VoximplantCallService,
  ) {}

  public async create(accountId: number, dto: CreateEntityEventDto): Promise<EntityEvent> {
    //TODO: Check do we need to check existence of same entity event
    return this.repository.save(EntityEvent.fromDto(accountId, dto));
  }

  public async findEntityEventItems(
    account: Account,
    user: User,
    entityId: number,
    activeFilter = EntityEventFilter.All,
    paging: PagingQuery,
  ): Promise<GetEntityEventResult> {
    const qb = await this.getEntityEventsQuery(account.id, entityId, activeFilter);
    const total = await qb.clone().getCount();

    let currentOffset = paging.skip;
    const resultData: EntityEventDataDto[] = [];

    while (resultData.length < paging.take && currentOffset < total) {
      const currentLimit = paging.take - resultData.length;
      const entityEventItems = await qb.clone().offset(currentOffset).limit(currentLimit).getMany();
      for (const entityEventItem of entityEventItems) {
        const dataObject: object = await this.findEntityEventItemData(account, user, entityEventItem);
        if (dataObject) {
          //TODO This is a temporary solution to filter mail objects with same thread.
          // Needs to be refactored to have a link to threadId in entityEvent table
          const isMailWithUniqueThreadId = this.checkIsMailWithUniqueThreadId(entityEventItem, dataObject, resultData);
          if (!isMailWithUniqueThreadId) {
            continue;
          }
          const dto = new EntityEventDataDto(
            entityEventItem.id,
            entityEventItem.type,
            dataObject,
            entityEventItem.createdAt.toISOString(),
          );
          resultData.push(dto);
        }
      }
      currentOffset += currentLimit;
    }

    return new GetEntityEventResult(resultData, new PagingMeta(currentOffset, total));
  }

  public async update(accountId: number, dto: UpdateEntityEventDto): Promise<EntityEvent | null> {
    if (!dto.oldEntityId) {
      return this.create(accountId, dto);
    } else if (!dto.entityId) {
      await this.delete(accountId, dto);
      return null;
    } else {
      const event = await this.repository.findOneBy({
        accountId,
        objectId: dto.objectId,
        entityId: dto.oldEntityId,
        type: dto.type,
      });
      event.entityId = dto.entityId;
      return this.repository.save(event);
    }
  }

  public async delete(accountId: number, dto: DeleteEntityEventDto): Promise<void> {
    await this.repository.delete({
      accountId: accountId,
      objectId: dto.objectId,
      type: dto.type,
    });
  }

  private async findEntityEventItemData(
    account: Account,
    user: User,
    entityEvent: EntityEvent,
  ): Promise<object | null> {
    const { objectId, entityId } = entityEvent;
    try {
      switch (entityEvent.type) {
        case EntityEventType.Activity:
          return this.activityService.findDtoForId(account, user, objectId);
        case EntityEventType.Call: {
          const call = await this.telephonyCallService.findOneFull(account.id, user, { id: objectId });
          return call ? call.toDto() : null;
        }
        case EntityEventType.Document:
          return this.fileLinkService.findDtoById(account, objectId);
        case EntityEventType.Mail:
          return this.mailMessageService.getThreadForMessageId(account.id, user, objectId);
        case EntityEventType.Note:
          return this.noteService.findOneDto({ account, filter: { entityId, noteId: objectId } });
        case EntityEventType.Order: {
          const order = await this.orderService.findOne(account.id, user, { orderId: objectId });
          return order ? order.toDto() : null;
        }
        case EntityEventType.RentalOrder: {
          const rentalOrder = await this.rentalOrderService.getOne(account.id, user, null, objectId);
          return rentalOrder ? rentalOrder.toDto() : null;
        }
        case EntityEventType.Shipment: {
          const shipment = await this.shipmentService.findOne({
            accountId: account.id,
            user,
            filter: { shipmentId: objectId },
          });
          return shipment ? shipment.toDto() : null;
        }
        case EntityEventType.Task:
          return this.taskService.findDtoById(account, user, objectId);
      }
    } catch {
      return null;
    }
  }

  private async getEntityEventsQuery(
    accountId: number,
    entityId: number,
    activeFilter: EntityEventFilter,
  ): Promise<SelectQueryBuilder<EntityEvent>> {
    let entityEventTypes: string[] | null = null;
    switch (activeFilter) {
      case EntityEventFilter.Activities:
        entityEventTypes = [EntityEventType.Activity];
        break;
      case EntityEventFilter.Calls:
        entityEventTypes = [EntityEventType.Call];
        break;
      //TODO Delete 'Files' after synchronization with frontend
      case EntityEventFilter.Documents:
        entityEventTypes = [EntityEventType.Document];
        break;
      case EntityEventFilter.Files || EntityEventFilter.Documents:
        entityEventTypes = [EntityEventType.Document];
        break;
      case EntityEventFilter.Orders:
        entityEventTypes = [EntityEventType.Order, EntityEventType.RentalOrder];
        break;
      case EntityEventFilter.Mail:
        entityEventTypes = [EntityEventType.Mail];
        break;
      case EntityEventFilter.Notes:
        entityEventTypes = [EntityEventType.Note];
        break;
      case EntityEventFilter.Shipments:
        entityEventTypes = [EntityEventType.Shipment];
        break;
      case EntityEventFilter.Tasks:
        entityEventTypes = [EntityEventType.Task];
        break;
      case EntityEventFilter.All:
        break;
    }
    const isAllType = !entityEventTypes;
    const isMailType = entityEventTypes?.includes(EntityEventType.Mail);
    const isCallType = entityEventTypes?.includes(EntityEventType.Call);
    const qb = this.repository.createQueryBuilder().select().where({ accountId });
    const linkedEntities =
      isAllType || isMailType || isCallType
        ? await this.entityLinkService.findMany({ accountId, sourceId: entityId })
        : [];
    const linkedEntitiesIds = linkedEntities.map((e) => e.targetId);
    switch (true) {
      case isAllType && !linkedEntitiesIds.length:
        qb.andWhere({ entityId });
        break;
      case isAllType && !!linkedEntitiesIds.length:
        qb.andWhere(
          new Brackets((qb) =>
            qb
              .where(`entity_id = :entityId`, { entityId })
              .orWhere(`(type in (:...types) and entity_id in (:...entityIds))`, {
                entityIds: linkedEntitiesIds,
                types: [EntityEventType.Mail, EntityEventType.Call],
              }),
          ),
        );
        break;
      case isCallType:
        qb.andWhere(`type = '${EntityEventType.Call}' and entity_id in (:...entityIds)`, {
          entityIds: [...linkedEntitiesIds, entityId],
        });
        break;
      case isMailType:
        qb.andWhere(`type = '${EntityEventType.Mail}' and entity_id in (:...entityIds)`, {
          entityIds: [...linkedEntitiesIds, entityId],
        });
        break;
      default:
        qb.andWhere({ entityId });
        if (entityEventTypes?.length) {
          qb.andWhere(`type in (:...types)`, { types: entityEventTypes });
        }
    }
    if (ExcludeEventTypes.length > 0) {
      qb.andWhere('type not in (:...excludeTypes)', { excludeTypes: ExcludeEventTypes });
    }
    return qb.orderBy('created_at', 'DESC').addOrderBy('id', 'DESC');
  }

  //TODO This is a temporary solution to filter mail objects with same thread.
  private checkIsMailWithUniqueThreadId(
    entityEventItem: EntityEvent,
    dataObject: any,
    resultData: EntityEventItemDto[],
  ): boolean {
    return entityEventItem.type === EntityEventType.Mail
      ? !resultData.some((item) => item.data.id === dataObject.id)
      : true;
  }
}
