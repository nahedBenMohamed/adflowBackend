import { OmitType } from '@nestjs/swagger';

import { EntityEventDto } from './entity-event.dto';

export class CreateEntityEventDto extends OmitType(EntityEventDto, ['id'] as const) {}
