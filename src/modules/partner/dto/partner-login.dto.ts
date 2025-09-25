import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PartnerLoginDto {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
