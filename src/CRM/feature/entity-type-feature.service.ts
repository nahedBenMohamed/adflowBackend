import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EntityTypeFeature } from './entities';
import { FeatureCode } from './enums';
import { FeatureService } from './feature.service';

@Injectable()
export class EntityTypeFeatureService {
  constructor(
    @InjectRepository(EntityTypeFeature)
    private repository: Repository<EntityTypeFeature>,
    private featureService: FeatureService,
  ) {}

  public async findByEntityTypeId(accountId: number, entityTypeId: number): Promise<EntityTypeFeature[]> {
    return await this.repository.findBy({ accountId, entityTypeId });
  }

  public async getFeatureCodesForEntityType(accountId: number, entityTypeId: number): Promise<FeatureCode[]> {
    const etfs = await this.findByEntityTypeId(accountId, entityTypeId);
    const features = await this.featureService.getByIds(etfs.map((etf) => etf.featureId));

    return features.map((feature) => feature.code as FeatureCode);
  }

  public async setEntityTypeFeatures(accountId: number, entityTypeId: number, featureIds: number[]): Promise<number[]> {
    await this.repository.delete({ entityTypeId });
    await this.repository.insert(
      featureIds.map((featureId) => new EntityTypeFeature(entityTypeId, featureId, accountId)),
    );
    return featureIds;
  }

  public async setFeaturesForEntityType(
    accountId: number,
    entityTypeId: number,
    featureCodes: FeatureCode[],
  ): Promise<number[]> {
    const features = await this.featureService.getByCodes(featureCodes);
    const featureIds = features.map((feature) => feature.id);

    return await this.setEntityTypeFeatures(accountId, entityTypeId, featureIds);
  }

  public async setFeatureForEntityTypes(
    accountId: number,
    entityTypes: number[],
    featureCode: FeatureCode,
  ): Promise<boolean> {
    const feature = await this.featureService.getByCode(featureCode);

    await this.repository.delete({ featureId: feature.id });

    const features = await this.repository.save(
      entityTypes.map((entityTypeId) => new EntityTypeFeature(entityTypeId, feature.id, accountId)),
    );

    return features.length > 0;
  }

  public async getEntityTypeIdsWithFeature(accountId: number, featureCode: FeatureCode): Promise<number[]> {
    const feature = await this.featureService.getByCode(featureCode);

    return (await this.repository.findBy({ accountId, featureId: feature.id })).map((etf) => etf.entityTypeId);
  }
}
