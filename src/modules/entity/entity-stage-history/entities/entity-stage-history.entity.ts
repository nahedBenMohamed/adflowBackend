import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { CreateEntityStageHistoryDto } from '../dto/create-entity-stage-history.dto';

@Entity()
export class EntityStageHistory {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  entityId: number;

  @Column()
  boardId: number;

  @Column()
  stageId: number;

  @Column()
  createdAt: Date;

  constructor(accountId: number, entityId: number, boardId: number, stageId: number, createdAt?: Date) {
    this.accountId = accountId;
    this.entityId = entityId;
    this.boardId = boardId;
    this.stageId = stageId;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  public static fromDto(accountId: number, dto: CreateEntityStageHistoryDto): EntityStageHistory {
    return new EntityStageHistory(
      accountId,
      dto.entityId,
      dto.boardId,
      dto.stageId,
      dto.createdAt ? DateUtil.fromISOString(dto.createdAt) : undefined,
    );
  }
}
