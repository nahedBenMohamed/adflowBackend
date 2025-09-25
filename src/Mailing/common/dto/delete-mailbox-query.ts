import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class DeleteMailboxQuery {
  @ApiPropertyOptional({ description: 'Save mailbox mail' })
  @IsOptional()
  @IsBoolean()
  save?: boolean;
}
