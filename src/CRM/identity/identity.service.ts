import { Injectable } from '@nestjs/common';

import { NotFoundError } from '@/common';
import { SequenceIdService } from '@/database';

import { SequenceName } from '../common';
import { IdentityPool } from './types';

const DefaultPoolSize = 20;

@Injectable()
export class IdentityService {
  constructor(private readonly sequenceIdService: SequenceIdService) {}

  public async getOne(sequence: SequenceName): Promise<number[]> {
    if (!Object.values(SequenceName).includes(sequence)) {
      throw new NotFoundError(`Sequence with name '${sequence}' is not found`);
    } else {
      return await this.sequenceIdService.getIdentityPool(sequence, DefaultPoolSize);
    }
  }

  public async getMany(): Promise<IdentityPool[]> {
    const sequences = Object.values(SequenceName);
    const pool: IdentityPool[] = [];
    for (const sequence of sequences) {
      const values = await this.getOne(sequence);
      pool.push(new IdentityPool({ name: sequence, values }));
    }
    return pool;
  }
}
