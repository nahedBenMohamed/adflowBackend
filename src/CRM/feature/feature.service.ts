import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { NotFoundError } from '@/common';

import { Feature } from './entities';
import { FeatureCode } from './enums';

@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(Feature)
    private featureRepository: Repository<Feature>,
  ) {}

  public async getEnabled(): Promise<Feature[]> {
    return await this.featureRepository.find({ where: { isEnabled: true }, order: { id: 'ASC' } });
  }

  public async getByCode(code: FeatureCode): Promise<Feature> {
    const feature = this.featureRepository.findOneBy({ code });
    if (!feature) {
      throw NotFoundError.withMessage(Feature, `with code '${code}' is not found`);
    }

    return feature;
  }

  public async getByCodes(codes: FeatureCode[]): Promise<Feature[]> {
    return await this.featureRepository.findBy({ code: In(codes) });
  }

  public async getByIds(ids: number[]): Promise<Feature[]> {
    return await this.featureRepository.findBy({ id: In(ids) });
  }
}
