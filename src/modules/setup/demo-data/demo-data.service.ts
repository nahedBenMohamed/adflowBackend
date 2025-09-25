import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserService } from '@/modules/iam/user/user.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { ProductService } from '@/modules/inventory/product/product.service';
import { OrderService } from '@/modules/inventory/order/services/order.service';
import { RentalOrderService } from '@/modules/inventory/rental-order/services/rental-order.service';
import { ScheduleAppointmentService } from '@/modules/scheduler/schedule-appointment/schedule-appointment.service';
import { EntityService } from '@/CRM/Service/Entity/EntityService';
import { TaskService } from '@/CRM/task/task.service';

import { DemoDataType } from '../common/enums/demo-data-type.enum';
import { DemoData } from './entities/demo-data.entity';

@Injectable()
export class DemoDataService {
  constructor(
    @InjectRepository(DemoData)
    private readonly repository: Repository<DemoData>,
    private readonly userService: UserService,
    private readonly entityService: EntityService,
    private readonly taskService: TaskService,
    private readonly productService: ProductService,
    private readonly orderService: OrderService,
    private readonly rentalService: RentalOrderService,
    private readonly appointmentService: ScheduleAppointmentService,
  ) {}

  public async create(accountId: number, type: DemoDataType, ids: number[]) {
    await this.repository.insert(new DemoData(accountId, type, ids));
  }

  public async exists(accountId: number): Promise<boolean> {
    return (await this.repository.countBy({ accountId })) > 0;
  }

  public async delete(accountId: number, user: User) {
    const demoData = await this.repository.findBy({ accountId });

    const appointments = demoData.filter((dd) => dd.type === DemoDataType.ScheduleAppointment);
    if (appointments.length) {
      await Promise.all(
        appointments.map((a) => this.appointmentService.delete({ accountId, user, filter: { appointmentId: a.ids } })),
      );
      await this.repository.delete(appointments.map((dd) => dd.id));
    }

    const rentalOrders = demoData.filter((dd) => dd.type === DemoDataType.RentalOrder);
    if (rentalOrders.length) {
      await Promise.all(rentalOrders.map((ro) => this.rentalService.delete(accountId, user, { orderId: ro.ids })));
      await this.repository.delete(rentalOrders.map((dd) => dd.id));
    }

    const salesOrders = demoData.filter((dd) => dd.type === DemoDataType.SalesOrder);
    if (salesOrders.length) {
      await Promise.all(salesOrders.map((order) => this.orderService.delete(accountId, { orderId: order.ids })));
      await this.repository.delete(salesOrders.map((dd) => dd.id));
    }

    const products = demoData.filter((dd) => dd.type === DemoDataType.Product);
    if (products.length) {
      await Promise.all(products.map((product) => this.productService.delete(accountId, product.ids)));
      await this.repository.delete(products.map((dd) => dd.id));
    }

    const tasks = demoData.filter((dd) => dd.type === DemoDataType.Task);
    if (tasks.length) {
      await Promise.all(
        tasks.map((task) => this.taskService.delete({ user, filter: { accountId, taskId: task.ids } })),
      );
      await this.repository.delete(tasks.map((dd) => dd.id));
    }

    const entities = demoData.filter((dd) => dd.type === DemoDataType.Entity);
    if (entities.length) {
      await Promise.all(entities.map((entity) => this.entityService.deleteMany(accountId, user, entity.ids)));
      await this.repository.delete(entities.map((dd) => dd.id));
    }

    const users = demoData.filter((dd) => dd.type === DemoDataType.User);
    if (users.length) {
      await Promise.all(users.map((user) => this.userService.delete({ accountId, userId: user.ids })));
      await this.repository.delete(users.map((dd) => dd.id));
    }
  }
}
