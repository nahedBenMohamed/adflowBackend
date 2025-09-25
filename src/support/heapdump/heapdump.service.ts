import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { writeSnapshot } from 'heapdump';

import { DateUtil } from '@/common';

import { SupportConfig } from '../config';

@Injectable()
export class HeapdumpService {
  private readonly _config: SupportConfig | undefined;

  constructor(private readonly configService: ConfigService) {
    this._config = this.configService.get<SupportConfig>('support');
  }

  public async writeSnapshot(code: string) {
    if (this._config?.accessCode && this._config.accessCode === code) {
      writeSnapshot(`heapdump-${DateUtil.now().toISOString()}.heapsnapshot`);
    }
  }
}
