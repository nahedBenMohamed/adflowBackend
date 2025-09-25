import { PartialType } from '@nestjs/swagger';
import { CreateVoximplantUserDto } from './create-voximplant-user.dto';

export class UpdateVoximplantUserDto extends PartialType(CreateVoximplantUserDto) {}
