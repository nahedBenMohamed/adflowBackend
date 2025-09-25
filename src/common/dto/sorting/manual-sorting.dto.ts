import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class ManualSorting {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  afterId?: number | null | undefined;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  beforeId?: number | null | undefined;
}
