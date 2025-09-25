import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { PermissionLevel } from '../common';

import { ObjectPermissionDto } from './dto';
import { ObjectPermission } from './entities';
import { PermissionNotValidError } from './errors';

const PermissionWeight = {
  [PermissionLevel.ALLOWED]: 4,
  [PermissionLevel.DEPARTMENT]: 3,
  [PermissionLevel.SUBDEPARTMENT]: 2,
  [PermissionLevel.RESPONSIBLE]: 1,
  [PermissionLevel.DENIED]: 0,
};

interface FindFilter {
  accountId: number;
  userId?: number;
  objectType?: string;
  objectId?: number;
}

const isBigger = (permission1: PermissionLevel, permission2: PermissionLevel): boolean => {
  return PermissionWeight[permission1] > PermissionWeight[permission2];
};

const cacheKey = ({ accountId, userId, objectType, objectId }: FindFilter) =>
  // eslint-disable-next-line max-len
  `ObjectPermission:${accountId}${userId ? `:${userId}` : ''}${objectType ? `:${objectType}` : ''}${objectId ? `:${objectId}` : ''}`;

@Injectable()
export class ObjectPermissionService {
  constructor(
    @InjectRepository(ObjectPermission)
    private readonly repository: Repository<ObjectPermission>,
    private readonly dataSource: DataSource,
  ) {}

  public async create({
    accountId,
    userId,
    hasDepartmentId,
    dtos,
  }: {
    accountId: number;
    userId: number;
    hasDepartmentId: boolean;
    dtos: ObjectPermissionDto[];
  }): Promise<ObjectPermission[]> {
    if (!this.check(dtos)) {
      throw new PermissionNotValidError();
    }

    return this.repository.save(
      dtos.map((dto) => ObjectPermission.fromDto({ accountId, userId, hasDepartmentId, dto })),
    );
  }

  public async findOne(filter: FindFilter): Promise<ObjectPermission | null> {
    return this.createFindQb(filter).cache(cacheKey(filter), 60000).getOne();
  }
  public async findMany(filter: FindFilter): Promise<ObjectPermission[]> {
    return this.createFindQb(filter).cache(cacheKey(filter), 60000).getMany();
  }

  public async update({
    accountId,
    userId,
    hasDepartmentId,
    dtos,
  }: {
    accountId: number;
    userId: number;
    hasDepartmentId: boolean;
    dtos: ObjectPermissionDto[];
  }): Promise<ObjectPermission[]> {
    if (!this.check(dtos)) {
      throw new PermissionNotValidError();
    }

    const permissions = await this.findMany({ accountId, userId });

    const created = dtos.filter((dto) => !permissions.some((p) => p.same(dto)));
    const updated = permissions.filter((p) => dtos.some((dto) => p.same(dto)));
    const deleted = permissions.filter((p) => !dtos.some((dto) => p.same(dto)));

    const result: ObjectPermission[] = [];
    if (created.length) {
      result.push(...(await this.create({ accountId, userId, hasDepartmentId, dtos: created })));
    }

    if (updated.length) {
      for (const u of updated) {
        const dto = dtos.find((dto) => u.same(dto));
        if (dto) {
          await this.repository.save(u.update({ hasDepartmentId, dto }));
          result.push(u);
        }
      }
    }

    if (deleted.length) {
      await this.repository.remove(deleted);
    }

    this.dataSource.queryResultCache?.remove([cacheKey({ accountId, userId })]);

    return result;
  }

  public async delete(filter: FindFilter): Promise<void> {
    await this.createFindQb(filter).delete().execute();
    this.dataSource.queryResultCache?.remove([cacheKey(filter)]);
  }

  private createFindQb(filter: FindFilter) {
    const qb = this.repository.createQueryBuilder().where('account_id = :accountId', { accountId: filter.accountId });

    if (filter.userId) {
      qb.andWhere('user_id = :userId', { userId: filter.userId });
    }
    if (filter.objectType) {
      qb.andWhere('object_type = :objectType', { objectType: filter.objectType });
    }
    if (filter.objectId) {
      qb.andWhere('object_id = :objectId', { objectId: filter.objectId });
    }

    return qb;
  }

  private check(dtos: ObjectPermissionDto[]): boolean {
    for (const dto of dtos) {
      if (isBigger(dto.editPermission, dto.viewPermission) || isBigger(dto.deletePermission, dto.editPermission)) {
        return false;
      }
      if (dto.createPermission === PermissionLevel.ALLOWED && dto.viewPermission === PermissionLevel.DENIED) {
        return false;
      }
    }
    return true;
  }
}
