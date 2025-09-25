import { PickType } from '@nestjs/swagger';
import { VoximplantUserDto } from './voximplant-user.dto';

export class CreateVoximplantUserDto extends PickType(VoximplantUserDto, ['isActive'] as const) {}
