import { Controller, Post, Query } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { HeapdumpService } from './heapdump.service';

@ApiExcludeController(true)
@Controller('support/heapdump')
export class HeapdumpController {
  constructor(private readonly service: HeapdumpService) {}

  @Post('create')
  public async writeSnapshot(@Query('code') code: string) {
    return this.service.writeSnapshot(code);
  }
}
