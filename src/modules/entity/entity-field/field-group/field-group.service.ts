import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NotFoundError, ObjectState } from '@/common';
import { SequenceIdService } from '@/database';

import { SequenceName } from '@/CRM/common/enums/sequence-name.enum';

import { CreateFieldGroupDto, UpdateFieldGroupDto } from './dto';
import { FieldGroup } from './entities';

interface FindFilter {
  accountId: number;
  entityTypeId?: number;
}

@Injectable()
export class FieldGroupService {
  constructor(
    @InjectRepository(FieldGroup)
    private readonly repository: Repository<FieldGroup>,
    private readonly sequenceIdService: SequenceIdService,
  ) {}

  private async nextIdentity(): Promise<number> {
    return this.sequenceIdService.nextIdentity(SequenceName.FieldGroup);
  }

  public async create({
    accountId,
    entityTypeId,
    dto,
  }: {
    accountId: number;
    entityTypeId: number;
    dto: CreateFieldGroupDto;
  }): Promise<FieldGroup> {
    dto.id = dto.id ?? (await this.nextIdentity());

    return await this.repository.save(FieldGroup.fromDto(accountId, entityTypeId, dto));
  }

  public async getById(id: number): Promise<FieldGroup> {
    const group = await this.repository.findOneBy({ id });

    if (!group) {
      throw NotFoundError.withId(FieldGroup, id);
    }

    return group;
  }

  public async findMany(filter: FindFilter): Promise<FieldGroup[]> {
    const qb = this.repository.createQueryBuilder().where('account_id = :accountId', { accountId: filter.accountId });

    if (filter?.entityTypeId) {
      qb.andWhere('entity_type_id = :entityTypeId', { entityTypeId: filter.entityTypeId });
    }

    return await qb.getMany();
  }

  public async delete(id: number): Promise<void> {
    const result = await this.repository.delete({ id });

    if (result.affected === 0) {
      throw NotFoundError.withId(FieldGroup, id);
    }
  }

  public async saveBatch({
    accountId,
    entityTypeId,
    dtos,
  }: {
    accountId: number;
    entityTypeId: number;
    dtos: UpdateFieldGroupDto[];
  }): Promise<void> {
    for (const dto of dtos) {
      if (dto.state === ObjectState.Created) {
        await this.create({ accountId, entityTypeId, dto });
      }

      if (dto.state === ObjectState.Updated) {
        await this.repository.update(dto.id, { name: dto.name, sortOrder: dto.sortOrder, code: dto.code });
      }

      if (dto.state === ObjectState.Deleted) {
        await this.delete(dto.id);
      }
    }
  }
}
