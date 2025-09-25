import { ApiPropertyOptional } from '@nestjs/swagger';

export class ExpandQuery<T> {
  @ApiPropertyOptional({ type: String, description: 'Expand fields' })
  expand?: string;

  get fields(): T[] {
    return this.expand?.split(',') as T[];
  }
}
