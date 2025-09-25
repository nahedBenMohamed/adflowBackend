import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateEntityStageHistoryDto } from './dto/create-entity-stage-history.dto';
import { EntityStageHistory } from './entities/entity-stage-history.entity';

@Injectable()
export class EntityStageHistoryService {
  constructor(
    @InjectRepository(EntityStageHistory)
    private readonly repository: Repository<EntityStageHistory>,
  ) {}

  public async create(accountId: number, dto: CreateEntityStageHistoryDto): Promise<EntityStageHistory> {
    return this.repository.save(EntityStageHistory.fromDto(accountId, dto));
  }

  public async copyHistory(accountId: number, fromId: number, toId: number) {
    await this.repository.update({ accountId, entityId: fromId }, { entityId: toId });
  }
}
