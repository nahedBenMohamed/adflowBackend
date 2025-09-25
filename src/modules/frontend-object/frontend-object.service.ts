import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FrontendObject } from './entities';

@Injectable()
export class FrontendObjectService {
  constructor(
    @InjectRepository(FrontendObject)
    private readonly repository: Repository<FrontendObject>,
  ) {}

  async findOne({ accountId, key }: { accountId: number; key: string }): Promise<FrontendObject> {
    return this.repository.findOne({ where: { accountId, key } });
  }

  async upsert({ accountId, key, value }: { accountId: number; key: string; value: unknown }): Promise<FrontendObject> {
    const obj = (await this.findOne({ accountId, key })) ?? new FrontendObject(accountId, key, value);
    obj.value = value;
    obj.createdAt = new Date();

    await this.repository.save(obj);
    return obj;
  }

  async delete({ accountId, key }: { accountId: number; key: string }): Promise<void> {
    await this.repository.delete({ accountId, key });
  }
}
