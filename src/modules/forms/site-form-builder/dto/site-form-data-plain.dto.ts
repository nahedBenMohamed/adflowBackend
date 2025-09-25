import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SiteFormDataPlainDto {
  @ApiPropertyOptional({ description: 'Test' })
  @IsOptional()
  @IsString()
  test?: string;

  [key: string]: string;
}
