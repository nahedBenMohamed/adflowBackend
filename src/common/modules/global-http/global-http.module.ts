import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import * as http from 'http';
import * as https from 'https';
import { DnsCacheService } from './dns-cache.service';

@Global()
@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: (dnsCacheService: DnsCacheService) => ({
        httpAgent: new http.Agent({ lookup: dnsCacheService.lookupFunction }),
        httpsAgent: new https.Agent({ lookup: dnsCacheService.lookupFunction }),
      }),
      inject: [DnsCacheService],
    }),
  ],
  providers: [DnsCacheService],
  exports: [HttpModule, DnsCacheService],
})
export class GlobalHttpModule {}
