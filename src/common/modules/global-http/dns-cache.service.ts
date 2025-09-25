import { Injectable } from '@nestjs/common';
import CacheableLookup, { LookupOptions as CacheableLookupOptions } from '@esm2cjs/cacheable-lookup';
import { LookupFunction } from 'net';

@Injectable()
export class DnsCacheService {
  private cacheableLookup: CacheableLookup;

  constructor() {
    this.cacheableLookup = new CacheableLookup({
      maxTtl: 300, // Cache DNS records for 5 minutes
      errorTtl: 30, // Cache DNS errors for 30 seconds
      fallbackDuration: 600, // Use outdated entries for 10 minutes if DNS is down
    });
  }

  get lookupFunction(): LookupFunction {
    return (hostname, options, callback) => {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      const cacheableLookupOptions = options as unknown as CacheableLookupOptions;
      return this.cacheableLookup.lookup(hostname, cacheableLookupOptions, callback);
    };
  }
}
