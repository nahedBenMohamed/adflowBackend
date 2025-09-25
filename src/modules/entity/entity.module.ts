import { Module } from '@nestjs/common';

import { EntityEventModule } from './entity-event/entity-event.module';
import { EntityFieldModule } from './entity-field/entity-field.module';
import { EntityInfoModule } from './entity-info/entity-info.module';
import { EntityStageHistoryModule } from './entity-stage-history/entity-stage-history.module';

@Module({
  imports: [EntityEventModule, EntityFieldModule, EntityInfoModule, EntityStageHistoryModule],
})
export class EntityModule {}
