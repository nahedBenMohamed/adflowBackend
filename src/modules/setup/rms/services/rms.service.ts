import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ReadyMadeSolution } from '../entities/ready-made-solution.entity';

interface FindFilter {
  code?: string;
  isActive?: boolean;
}

@Injectable()
export class RmsService {
  constructor(
    @InjectRepository(ReadyMadeSolution)
    private repository: Repository<ReadyMadeSolution>,
  ) {}

  public async findOne(filter?: FindFilter): Promise<ReadyMadeSolution | null> {
    return this.createQb(filter).getOne();
  }

  public async findMany(filter?: FindFilter): Promise<ReadyMadeSolution[]> {
    return this.createQb(filter).getMany();
  }

  private createQb(filter?: FindFilter) {
    const qb = this.repository.createQueryBuilder('rms').orderBy('sort_order', 'ASC');

    if (filter?.code) {
      qb.where({ code: filter.code });
    }
    if (filter?.isActive !== undefined) {
      qb.where({ active: filter.isActive });
    }

    return qb;
  }
}
