import { PickType } from '@nestjs/swagger';
import { EntityTypeLinkDto } from './entity-type-link.dto';

export class UpdateEntityTypeLinkDto extends PickType(EntityTypeLinkDto, ['targetId', 'sortOrder'] as const) {}
