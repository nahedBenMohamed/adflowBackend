import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductsSectionEntityType } from '../entities';

@Injectable()
export class ProductsSectionLinkerService {
  constructor(
    @InjectRepository(ProductsSectionEntityType)
    private readonly repository: Repository<ProductsSectionEntityType>,
  ) {}

  public async getLinkedSectionIds(accountId: number, entityTypeId: number): Promise<number[]> {
    const pset = await this.repository.findBy({ accountId, entityTypeId });

    return pset.map((p) => p.sectionId);
  }

  public async linkSectionWithEntityTypes(
    accountId: number,
    sectionId: number,
    entityTypeIds: number[],
  ): Promise<ProductsSectionEntityType[]> {
    await this.repository.delete({ accountId, sectionId });

    return await this.repository.save(
      entityTypeIds.map((etId) => new ProductsSectionEntityType(accountId, sectionId, etId)),
    );
  }

  public async linkEntityTypeWithSections(
    accountId: number,
    entityTypeId: number,
    sectionIds: number[],
  ): Promise<ProductsSectionEntityType[]> {
    await this.repository.delete({ accountId, entityTypeId });

    return await this.repository.save(
      sectionIds.map((sid) => new ProductsSectionEntityType(accountId, sid, entityTypeId)),
    );
  }

  public async ensureLinked(accountId: number, sectionId: number, entityTypeId: number): Promise<void> {
    await this.repository.save({ accountId, sectionId, entityTypeId });
  }
}
