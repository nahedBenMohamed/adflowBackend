import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { VoximplantSIPDto } from './voximplant-sip.dto';

export class CreateVoximplantSIPDto extends PickType(VoximplantSIPDto, ['type', 'name', 'userIds'] as const) {
  @ApiProperty()
  @IsString()
  proxy: string;

  @ApiProperty()
  @IsString()
  sipUsername: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  authUser?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  outboundProxy?: string;
}
