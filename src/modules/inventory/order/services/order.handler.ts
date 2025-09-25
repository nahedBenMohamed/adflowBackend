import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';

import { ProductsEventType, ShipmentStatusChangedEvent } from '../../common';
import { OrderService } from './order.service';

@Injectable()
export class OrderHandler {
  constructor(private readonly service: OrderService) {}

  @Cron(CronExpression.EVERY_HOUR)
  public async checkCancelOrders() {
    if (process.env.SCHEDULE_PRODUCTS_ORDER_CHECK_CANCEL_DISABLE === 'true') return;
    this.service.checkCancelOrders();
  }

  @OnEvent(ProductsEventType.ShipmentStatusChanged, { async: true })
  public async onShipmentStatusChanged(event: ShipmentStatusChangedEvent): Promise<void> {
    this.service.processShipmentStatusChanged({
      accountId: event.accountId,
      sectionId: event.sectionId,
      orderId: event.orderId,
      statusId: event.statusId,
    });
  }
}
