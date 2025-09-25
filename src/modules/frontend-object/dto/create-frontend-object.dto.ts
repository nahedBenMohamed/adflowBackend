import { PickType } from '@nestjs/swagger';
import { FrontendObjectDto } from './frontend-object.dto';

export class CreateFrontendObjectDto extends PickType(FrontendObjectDto, ['key', 'value'] as const) {}

