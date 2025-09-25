import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class GeneralReportFilterVisibilityEntityDto {
  @ApiPropertyOptional({ nullable: true, description: 'Exclude entities block' })
  @IsOptional()
  @IsBoolean()
  exclude?: boolean | null;

  @ApiPropertyOptional({ nullable: true, description: 'Exclude open entities' })
  @IsOptional()
  @IsBoolean()
  excludeOpen?: boolean | null;

  @ApiPropertyOptional({ nullable: true, description: 'Exclude lost entities' })
  @IsOptional()
  @IsBoolean()
  excludeLost?: boolean | null;

  @ApiPropertyOptional({ nullable: true, description: 'Exclude won entities' })
  @IsOptional()
  @IsBoolean()
  excludeWon?: boolean | null;
}
