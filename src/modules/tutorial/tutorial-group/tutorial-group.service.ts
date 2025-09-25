import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { NotFoundError, SortOrderListDto } from '@/common';

import { TutorialProductType } from '../common';
import { TutorialItemService } from '../tutorial-item';
import { ExpandableField } from './types';
import { CreateTutorialGroupDto, UpdateTutorialGroupDto } from './dto';
import { TutorialGroup } from './entities';

interface FindFilter {
  groupId?: number;
  userId?: number;
  productType?: TutorialProductType;
  objectId?: number;
}
interface FindOptions {
  expand?: ExpandableField[];
}

@Injectable()
export class TutorialGroupService {
  constructor(
    @InjectRepository(TutorialGroup)
    private readonly repository: Repository<TutorialGroup>,
    private readonly itemService: TutorialItemService,
  ) {}

  public async create(accountId: number, dto: CreateTutorialGroupDto): Promise<TutorialGroup> {
    return this.repository.save(TutorialGroup.fromDto(accountId, dto));
  }

  public async findOne(accountId: number, filter?: FindFilter, options?: FindOptions): Promise<TutorialGroup | null> {
    const group = await this.createFindQb(accountId, filter).getOne();

    return group && options?.expand ? await this.expandOne(group, options.expand, filter) : group;
  }

  public async findMany(accountId: number, filter?: FindFilter, options?: FindOptions): Promise<TutorialGroup[]> {
    const groups = await this.createFindQb(accountId, filter).orderBy('tg.sort_order').getMany();

    return groups && options?.expand ? await this.expandMany(groups, options.expand, filter) : groups;
  }

  public async update(accountId: number, groupId: number, dto: UpdateTutorialGroupDto): Promise<TutorialGroup> {
    const group = await this.findOne(accountId, { groupId });
    if (!group) {
      throw NotFoundError.withId(TutorialGroup, groupId);
    }

    return this.repository.save(group.update(dto));
  }

  public async sort(accountId: number, dto: SortOrderListDto) {
    for (const item of dto.items) {
      await this.repository.update({ id: item.id, accountId }, { sortOrder: item.sortOrder });
    }
  }

  public async delete(accountId: number, groupId: number) {
    await this.repository.delete({ id: groupId, accountId });
  }

  private createFindQb(accountId: number, filter?: FindFilter) {
    const qb = this.repository.createQueryBuilder('tg').where('tg.account_id = :accountId', { accountId });
    if (filter?.groupId) {
      qb.andWhere('tg.id = :id', { id: filter.groupId });
    }
    if (filter?.userId || filter?.productType || filter?.objectId) {
      qb.leftJoin('tutorial_item', 'ti', 'tg.id = ti.group_id');
      if (filter?.userId) {
        qb.leftJoin('tutorial_item_user', 'tiu', 'ti.id = tiu.item_id');
        qb.andWhere(
          new Brackets((qb1) =>
            qb1.where('tiu.user_id = :userId', { userId: filter.userId }).orWhere('tiu.user_id IS NULL'),
          ),
        );
      }
      if (filter?.productType || filter?.objectId) {
        qb.leftJoin('tutorial_item_product', 'tip', 'ti.id = tip.item_id');
        if (filter?.productType) {
          qb.andWhere(
            new Brackets((qb2) =>
              qb2.where('tip.type = :type', { type: filter.productType }).orWhere('tip.type IS NULL'),
            ),
          );
        }
        if (filter?.objectId) {
          qb.andWhere(
            new Brackets((qb3) =>
              qb3.where('tip.object_id = :objectId', { objectId: filter.objectId }).orWhere('tip.object_id IS NULL'),
            ),
          );
        }
      }
    }
    return qb;
  }

  private async expandOne(
    group: TutorialGroup,
    expand: ExpandableField[],
    filter?: FindFilter,
  ): Promise<TutorialGroup> {
    if (expand.includes(ExpandableField.items)) {
      group.items = await this.itemService.findMany(group.accountId, { ...filter, groupId: group.id });
    }
    return group;
  }
  private async expandMany(
    groups: TutorialGroup[],
    expand: ExpandableField[],
    filter?: FindFilter,
  ): Promise<TutorialGroup[]> {
    return await Promise.all(groups.map((group) => this.expandOne(group, expand, filter)));
  }
}
