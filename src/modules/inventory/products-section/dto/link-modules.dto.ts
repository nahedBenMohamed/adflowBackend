import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

export class LinkModulesDto {
  @ApiProperty({ type: [Number], nullable: true })
  @IsOptional()
  @IsArray()
  entityTypeIds: number[] | null;

  @ApiPropertyOptional({ type: [Number], nullable: true })
  @IsOptional()
  @IsArray()
  schedulerIds?: number[] | null;
}
