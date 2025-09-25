import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { NotFoundError, SortOrderListDto } from '@/common';

import { TutorialProductType } from '../common';
import { CreateTutorialItemDto, UpdateTutorialItemDto } from './dto';
import { TutorialItem, TutorialItemProduct, TutorialItemUser } from './entities';

interface FindFilter {
  itemId?: number;
  groupId?: number;
  userId?: number;
  productType?: TutorialProductType;
  objectId?: number;
  createdFrom?: Date;
}

@Injectable()
export class TutorialItemService {
  constructor(
    @InjectRepository(TutorialItem)
    private readonly itemRepository: Repository<TutorialItem>,
    @InjectRepository(TutorialItemUser)
    private readonly userRepository: Repository<TutorialItemUser>,
    @InjectRepository(TutorialItemProduct)
    private readonly productRepository: Repository<TutorialItemProduct>,
  ) {}

  public async create(accountId: number, groupId: number, dto: CreateTutorialItemDto): Promise<TutorialItem> {
    const item = await this.itemRepository.save(TutorialItem.fromDto(accountId, groupId, dto));

    if (dto.userIds?.length) {
      item.users = await this.userRepository.save(dto.userIds.map((userId) => new TutorialItemUser(item.id, userId)));
    }

    if (dto.products?.length) {
      item.products = await this.productRepository.save(
        dto.products.map((product) => TutorialItemProduct.fromDto(accountId, item.id, product)),
      );
    }

    return item;
  }

  public async findOne(accountId: number, filter?: FindFilter): Promise<TutorialItem | null> {
    return this.createFindQb(accountId, filter).getOne();
  }
  public async findMany(accountId: number, filter?: FindFilter): Promise<TutorialItem[]> {
    return this.createFindQb(accountId, filter).orderBy('ti.sort_order').getMany();
  }
  public async count(accountId: number, filter?: FindFilter): Promise<number> {
    return this.createFindQb(accountId, filter).getCount();
  }

  public async update(
    accountId: number,
    groupId: number,
    itemId: number,
    dto: UpdateTutorialItemDto,
  ): Promise<TutorialItem> {
    const item = await this.findOne(accountId, { groupId, itemId });
    if (!item) {
      throw NotFoundError.withId(TutorialItem, itemId);
    }

    if (dto.userIds !== undefined) {
      await this.userRepository.delete({ itemId: item.id });
      if (dto.userIds?.length) {
        item.users = await this.userRepository.save(dto.userIds.map((userId) => new TutorialItemUser(item.id, userId)));
      } else {
        item.users = [];
      }
    }

    if (dto.products !== undefined) {
      await this.productRepository.delete({ accountId, itemId: item.id });
      if (dto.products?.length) {
        item.products = await this.productRepository.save(
          dto.products.map((product) => TutorialItemProduct.fromDto(accountId, item.id, product)),
        );
      } else {
        item.products = [];
      }
    }

    return this.itemRepository.save(item.update(dto));
  }

  public async sort(accountId: number, dto: SortOrderListDto) {
    for (const item of dto.items) {
      await this.itemRepository.update({ id: item.id, accountId }, { sortOrder: item.sortOrder });
    }
  }

  public async delete(accountId: number, groupId: number, itemId: number) {
    await this.itemRepository.delete({ id: itemId, groupId, accountId });
  }

  public async deleteUser(_accountId: number, userId: number) {
    await this.userRepository.delete({ userId });
  }

  public async deleteProduct(accountId: number, type: TutorialProductType, objectId: number) {
    await this.productRepository.delete({ accountId, type, objectId });
  }

  private createFindQb(accountId: number, filter?: FindFilter) {
    const qb = this.itemRepository
      .createQueryBuilder('ti')
      .leftJoinAndMapMany('ti.users', TutorialItemUser, 'tiu', 'ti.id = tiu.item_id')
      .leftJoinAndMapMany('ti.products', TutorialItemProduct, 'tip', 'ti.id = tip.item_id')
      .where('ti.account_id = :accountId', { accountId });
    if (filter?.itemId) {
      qb.andWhere('ti.id = :id', { id: filter.itemId });
    }
    if (filter?.groupId) {
      qb.andWhere('ti.group_id = :groupId', { groupId: filter.groupId });
    }
    if (filter?.userId) {
      qb.andWhere(
        new Brackets((qb1) =>
          qb1.where('tiu.user_id = :userId', { userId: filter.userId }).orWhere('tiu.user_id IS NULL'),
        ),
      );
    }
    if (filter?.productType) {
      qb.andWhere(
        new Brackets((qb2) => qb2.where('tip.type = :type', { type: filter.productType }).orWhere('tip.type IS NULL')),
      );
    }
    if (filter?.objectId) {
      qb.andWhere(
        new Brackets((qb3) =>
          qb3.where('tip.object_id = :objectId', { objectId: filter.objectId }).orWhere('tip.object_id IS NULL'),
        ),
      );
    }
    if (filter?.createdFrom) {
      qb.andWhere('ti.created_at >= :createdFrom', { createdFrom: filter.createdFrom });
    }
    return qb;
  }
}
