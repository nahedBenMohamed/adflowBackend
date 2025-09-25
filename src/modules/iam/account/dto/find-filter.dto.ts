import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindFilterDto {
  @ApiPropertyOptional({ description: 'Account subdomain search' })
  @IsOptional()
  @IsString()
  search?: string | null;
}
