import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderStatusCode } from './enums/order-status-code.enum';
import { CreateOrderStatusDto } from './dto/create-order-status.dto';
import { OrderStatus } from './entities/order-status.entity';

interface FindFilter {
  statusId?: number;
  code?: OrderStatusCode;
}

@Injectable()
export class OrderStatusService {
  constructor(
    @InjectRepository(OrderStatus)
    private readonly repository: Repository<OrderStatus>,
  ) {}

  public async create(accountId: number, dto: CreateOrderStatusDto): Promise<OrderStatus> {
    return await this.repository.save(OrderStatus.fromDto(accountId, dto));
  }

  public async findOne(accountId: number, filter?: FindFilter): Promise<OrderStatus> {
    return this.createQb(accountId, filter).getOne();
  }
  public async findMany(accountId: number, filter?: FindFilter): Promise<OrderStatus[]> {
    return this.createQb(accountId, filter).getMany();
  }

  public async getManyOrDefault(accountId: number): Promise<OrderStatus[]> {
    const statuses = await this.repository.find({ where: { accountId }, order: { sortOrder: 'ASC' } });
    if (statuses.length === 0) {
      return await this.createDefaultStatuses(accountId);
    }
    return statuses;
  }

  private createQb(accountId: number, filter?: FindFilter) {
    const qb = this.repository.createQueryBuilder('os').where('os.account_id = :accountId', { accountId });
    if (filter?.statusId) {
      qb.andWhere('os.id = :id', { id: filter.statusId });
    }
    if (filter?.code) {
      qb.andWhere('os.code = :code', { code: filter.code });
    }
    return qb;
  }

  private async createDefaultStatuses(accountId: number): Promise<OrderStatus[]> {
    let sortOrder = 0;
    const dtos = [
      CreateOrderStatusDto.system('Reserved', '#ea925a', OrderStatusCode.Reserved, sortOrder++),
      CreateOrderStatusDto.system('Sent for shipment', '#a33cab', OrderStatusCode.SentForShipment, sortOrder++),
      CreateOrderStatusDto.system('Shipped', '#8af039', OrderStatusCode.Shipped, sortOrder++),
      CreateOrderStatusDto.system('Cancelled', '#ee675c', OrderStatusCode.Cancelled, sortOrder++),
      CreateOrderStatusDto.system('Returned', '#c0c5cc', OrderStatusCode.Returned, sortOrder++),
    ];
    return await Promise.all(dtos.map(async (dto) => await this.create(accountId, dto)));
  }
}
