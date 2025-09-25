import { OmitType } from '@nestjs/swagger';

import { EntityEventDto } from './entity-event.dto';

export class DeleteEntityEventDto extends OmitType(EntityEventDto, ['id', 'createdAt'] as const) {}
