import { OmitType } from '@nestjs/swagger';

import { RentalOrderItemDto } from './rental-order-item.dto';

export class CreateRentalOrderItemDto extends OmitType(RentalOrderItemDto, ['id'] as const) {}
