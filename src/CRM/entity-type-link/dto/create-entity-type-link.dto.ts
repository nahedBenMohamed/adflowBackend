import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { EntityTypeLinkDto } from './entity-type-link.dto';

export class CreateEntityTypeLinkDto extends PickType(EntityTypeLinkDto, ['targetId'] as const) {
  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
