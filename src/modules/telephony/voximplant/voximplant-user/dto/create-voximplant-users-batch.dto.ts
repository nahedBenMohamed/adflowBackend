import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { VoximplantUserDto } from './voximplant-user.dto';

export class CreateVoximplantUsersBatchDto extends PickType(VoximplantUserDto, ['isActive'] as const) {
  @ApiProperty({ type: Number, isArray: true })
  @IsNumber({}, { each: true })
  userIds: number[];
}
