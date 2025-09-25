import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { CreateRentalOrderItemDto, UpdateRentalOrderItemDto } from '../dto';
import { RentalOrderItem } from '../entities';

@Injectable()
export class RentalOrderItemService {
  constructor(
    @InjectRepository(RentalOrderItem)
    private readonly repository: Repository<RentalOrderItem>,
  ) {}

  public async create({
    accountId,
    orderId,
    dto,
  }: {
    accountId: number;
    orderId: number;
    dto: CreateRentalOrderItemDto;
  }): Promise<RentalOrderItem> {
    return this.repository.save(RentalOrderItem.fromDto(accountId, orderId, dto));
  }
  public async createMany({
    accountId,
    orderId,
    dtos,
  }: {
    accountId: number;
    orderId: number;
    dtos: CreateRentalOrderItemDto[];
  }): Promise<RentalOrderItem[]> {
    return Promise.all(dtos.map((dto) => this.create({ accountId, orderId, dto })));
  }

  public async update({
    accountId,
    orderId,
    dto,
  }: {
    accountId: number;
    orderId: number;
    dto: UpdateRentalOrderItemDto;
  }): Promise<RentalOrderItem> {
    return this.repository.save(RentalOrderItem.fromDto(accountId, orderId, dto, dto.id));
  }

  public async updateMany({
    accountId,
    orderId,
    dtos,
  }: {
    accountId: number;
    orderId: number;
    dtos: UpdateRentalOrderItemDto[];
  }): Promise<RentalOrderItem[]> {
    return Promise.all(dtos.map((dto) => this.update({ accountId, orderId, dto })));
  }

  public async processBatch({
    accountId,
    orderId,
    items,
    dtos,
  }: {
    accountId: number;
    orderId: number;
    items: RentalOrderItem[];
    dtos: UpdateRentalOrderItemDto[];
  }): Promise<RentalOrderItem[]> {
    const added = dtos.filter((dto) => !items.some((item) => item.id === dto.id));
    const updated = dtos.filter((dto) => items.some((item) => item.id === dto.id));
    const removed = items.filter((item) => !dtos.some((dto) => dto.id === item.id));

    await this.deleteMany({ accountId, orderId, ids: removed.map((i) => i.id) });

    const result: RentalOrderItem[] = [];
    result.push(...(await this.createMany({ accountId, orderId, dtos: added })));
    result.push(...(await this.updateMany({ accountId, orderId, dtos: updated })));
    return result;
  }

  public async deleteMany({
    accountId,
    orderId,
    ids,
  }: {
    accountId: number;
    orderId: number;
    ids: number[];
  }): Promise<void> {
    await this.repository.delete({ accountId, orderId, id: In(ids) });
  }
}
