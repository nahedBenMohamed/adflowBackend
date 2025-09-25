import { PickType } from '@nestjs/swagger';
import { WarehouseDto } from './warehouse.dto';

export class UpdateWarehouseDto extends PickType(WarehouseDto, ['name'] as const) {}
