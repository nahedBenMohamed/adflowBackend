import { SetMetadata } from '@nestjs/common';
import { type DataPrefetch } from '../types/data-prefetch';

export const AuthDataPrefetch = (prefetch?: DataPrefetch) => SetMetadata('prefetch', prefetch);
