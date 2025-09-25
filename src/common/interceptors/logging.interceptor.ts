import { Logger, Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Request');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const now = Date.now();
    request.id = now.toString();
    const msg = `${request.id} ${request.method} ${request.hostname}${request.originalUrl}`;
    const user = `User: <${request.accountId ?? ''}; ${request.userId ?? ''}; ${request.ips?.[0] ?? request.ip}>`;

    this.logger.log(`${msg}\t${user}`);

    return next.handle().pipe(tap(() => this.logger.log(`${msg}\t<${Date.now() - now}ms>`, 'Response')));
  }
}
