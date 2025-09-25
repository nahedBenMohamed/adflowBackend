import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformToDtoInterceptor implements NestInterceptor {
  private transformData(data: any) {
    return data?.toDto ? data.toDto() : data;
  }

  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return data.map(this.transformData);
        }

        return this.transformData(data);
      }),
    );
  }
}
