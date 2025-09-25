import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { EntityInfoDto } from '@/modules/entity/entity-info';
import { IsOptional } from 'class-validator';

export class EntitySearchForCallResultDto {
  @ApiProperty({ description: 'Entity info', type: EntityInfoDto, nullable: true })
  @IsOptional()
  entity: EntityInfoDto | null;

  @ApiPropertyOptional({ description: 'Entity info', type: EntityInfoDto, nullable: true })
  @IsOptional()
  linked?: EntityInfoDto | null;
}
