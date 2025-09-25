import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { OrderStatusCode } from '../enums/order-status-code.enum';
import { CreateOrderStatusDto } from '../dto/create-order-status.dto';
import { OrderStatusDto } from '../dto/order-status.dto';

@Entity()
export class OrderStatus {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  name: string;

  @Column()
  color: string;

  @Column()
  code: OrderStatusCode | null;

  @Column()
  sortOrder: number;

  @Column()
  accountId: number;

  constructor(accountId: number, name: string, color: string, code: OrderStatusCode | null, sortOrder: number) {
    this.accountId = accountId;
    this.name = name;
    this.color = color;
    this.code = code;
    this.sortOrder = sortOrder;
  }

  public static fromDto(accountId: number, dto: CreateOrderStatusDto): OrderStatus {
    return new OrderStatus(accountId, dto.name, dto.color, dto.code, dto.sortOrder);
  }

  public toDto(): OrderStatusDto {
    return new OrderStatusDto(this.id, this.name, this.color, this.code, this.sortOrder);
  }
}
