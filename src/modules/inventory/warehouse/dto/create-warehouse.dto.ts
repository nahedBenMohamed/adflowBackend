import { PickType } from '@nestjs/swagger';
import { WarehouseDto } from './warehouse.dto';

export class CreateWarehouseDto extends PickType(WarehouseDto, ['name'] as const) {}
