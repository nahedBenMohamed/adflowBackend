import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { ObjectState } from '@/common';
import { SequenceIdService } from '@/database';

import { SequenceName } from '@/CRM/common/enums/sequence-name.enum';

import { CreateFieldOptionDto, UpdateFieldOptionDto } from './dto';
import { FieldOption } from './entities';

interface FindFilter {
  accountId: number;
  fieldId: number;
}

const cacheKey = ({ accountId, fieldId }: { accountId: number; fieldId: number }) =>
  `FieldOption:${accountId}:${fieldId}`;

@Injectable()
export class FieldOptionService {
  constructor(
    @InjectRepository(FieldOption)
    private readonly repository: Repository<FieldOption>,
    private readonly dataSource: DataSource,
    private readonly sequenceIdService: SequenceIdService,
  ) {}

  private async nextIdentity(): Promise<number> {
    return this.sequenceIdService.nextIdentity(SequenceName.FieldOption);
  }

  public async create({
    accountId,
    fieldId,
    dto,
  }: {
    accountId: number;
    fieldId: number;
    dto: CreateFieldOptionDto;
  }): Promise<FieldOption> {
    dto.id = dto.id ?? (await this.nextIdentity());

    return this.repository.save(FieldOption.fromDto(accountId, fieldId, dto));
  }
  public async createMany({
    accountId,
    fieldId,
    dtos,
  }: {
    accountId: number;
    fieldId: number;
    dtos: CreateFieldOptionDto[];
  }): Promise<FieldOption[]> {
    return Promise.all(dtos.map((dto) => this.create({ accountId, fieldId, dto })));
  }

  public async findMany(filter: FindFilter): Promise<FieldOption[]> {
    return this.createFindQb(filter).cache(cacheKey(filter), 600000).getMany();
  }

  public async processBatch({
    accountId,
    fieldId,
    dtos,
  }: {
    accountId: number;
    fieldId: number;
    dtos: UpdateFieldOptionDto[];
  }): Promise<FieldOption[]> {
    const created = dtos.filter((dto) => dto.state === ObjectState.Created) as CreateFieldOptionDto[];
    const updated = dtos.filter((dto) => dto.state === ObjectState.Updated);
    const deleted = dtos.filter((dto) => dto.state === ObjectState.Deleted);

    const options: FieldOption[] = [];
    if (created.length) {
      options.push(...(await this.createMany({ accountId, fieldId, dtos: created })));
    }
    if (updated.length) {
      const options = await this.findMany({ accountId, fieldId });
      options.push(
        ...(await Promise.all(
          updated.map(async (dto) => {
            const option = options.find((option) => option.id === dto.id);
            if (option) {
              await this.repository.save(option.update(dto));
              return option;
            }
            return null;
          }),
        )),
      );
    }
    if (deleted.length) {
      await Promise.all(deleted.map((dto) => this.delete({ accountId, fieldId, optionId: dto.id })));
    }

    this.dataSource.queryResultCache?.remove([cacheKey({ accountId, fieldId })]);

    return options;
  }

  private async delete({
    accountId,
    fieldId,
    optionId,
  }: {
    accountId: number;
    fieldId: number;
    optionId?: number;
  }): Promise<void> {
    await this.repository.delete({ accountId, fieldId, id: optionId });
  }

  private createFindQb(filter: FindFilter) {
    return this.repository
      .createQueryBuilder()
      .where('account_id = :accountId', { accountId: filter.accountId })
      .andWhere('field_id = :fieldId', { fieldId: filter.fieldId });
  }
}
