import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EntityStageHistory } from './entities/entity-stage-history.entity';
import { EntityStageHistoryService } from './entity-stage-history.service';
import { EntityStageHistoryHandler } from './entity-stage-history.handler';

@Module({
  imports: [TypeOrmModule.forFeature([EntityStageHistory])],
  providers: [EntityStageHistoryService, EntityStageHistoryHandler],
})
export class EntityStageHistoryModule {}
