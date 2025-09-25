import { Module } from '@nestjs/common';

import { FrontendEventGateway } from './frontend-event.gateway';
import { FrontendEventService } from './frontend-event.service';

@Module({
  providers: [FrontendEventGateway, FrontendEventService],
})
export class FrontendEventModule {}
