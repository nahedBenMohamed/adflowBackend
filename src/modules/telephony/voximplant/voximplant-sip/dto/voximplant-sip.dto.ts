import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { PbxProviderType } from '../enums';
import { VoximplantSIPRegistrationDto } from './voximplant-sip-registration.dto';

export class VoximplantSIPDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  externalId: number;

  @ApiProperty({ enum: PbxProviderType })
  @IsEnum(PbxProviderType)
  type: PbxProviderType;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ type: [Number], nullable: true })
  @IsOptional()
  @IsNumber({}, { each: true })
  userIds?: number[] | null;

  @ApiPropertyOptional({ type: VoximplantSIPRegistrationDto })
  registration?: VoximplantSIPRegistrationDto;

  constructor({ id, externalId, type, name, userIds, registration }: VoximplantSIPDto) {
    this.id = id;
    this.externalId = externalId;
    this.type = type;
    this.name = name;
    this.userIds = userIds;
    this.registration = registration;
  }
}
