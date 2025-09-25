import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { CreateVoximplantCallDto } from './create-voximplant-call.dto';

export class CreateVoximplantCallExtDto extends CreateVoximplantCallDto {
  @ApiProperty()
  @IsString()
  userName: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  viPhoneNumber?: string | null;
}
