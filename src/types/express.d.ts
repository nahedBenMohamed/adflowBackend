// types/express.d.ts
import 'express';

declare module 'express' {
  export interface Request {
    id?: string;
    subdomain?: string;
    callerAccountId?: number;
    accountId?: number;
    userId?: number;
    token?: unknown;
    account?: unknown;
    user?: unknown;
  }
}
