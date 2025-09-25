import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RecoveryUserPasswordDto {
  @ApiProperty()
  @IsString()
  email: string;
}
