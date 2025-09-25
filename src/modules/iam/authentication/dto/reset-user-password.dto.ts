import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ResetUserPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  password: string;
}
