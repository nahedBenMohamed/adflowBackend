import { Module } from '@nestjs/common';

import { HeapdumpService } from './heapdump.service';
import { HeapdumpController } from './heapdump.controller';

@Module({
  providers: [HeapdumpService],
  controllers: [HeapdumpController],
})
export class HeapdumpModule {}
