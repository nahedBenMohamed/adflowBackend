import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class GeneralReportFilterVisibilityTaskDto {
  @ApiPropertyOptional({ nullable: true, description: 'Exclude tasks block' })
  @IsOptional()
  @IsBoolean()
  exclude?: boolean | null;

  @ApiPropertyOptional({ nullable: true, description: 'Exclude open tasks' })
  @IsOptional()
  @IsBoolean()
  excludeOpen?: boolean | null;

  @ApiPropertyOptional({ nullable: true, description: 'Exclude expired tasks' })
  @IsOptional()
  @IsBoolean()
  excludeExpired?: boolean | null;

  @ApiPropertyOptional({ nullable: true, description: 'Exclude resolved tasks' })
  @IsOptional()
  @IsBoolean()
  excludeResolved?: boolean | null;
}
