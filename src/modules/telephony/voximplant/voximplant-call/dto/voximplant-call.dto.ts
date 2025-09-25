import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

import { EntityInfoDto } from '@/modules/entity/entity-info/dto/entity-info.dto';
import { CallDirection, CallStatus } from '../../common';

export class VoximplantCallDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  sessionId: string;

  @ApiProperty()
  @IsString()
  callId: string;

  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  numberId: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  entityId?: number | null;

  @ApiProperty({ enum: CallDirection })
  @IsEnum(CallDirection)
  direction: CallDirection;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  duration?: number | null;

  @ApiPropertyOptional({ nullable: true, enum: CallStatus })
  @IsOptional()
  @IsEnum(CallStatus)
  status?: CallStatus | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  failureReason?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  recordUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  comment: string | null;

  @ApiProperty()
  @IsString()
  createdAt: string;

  @ApiPropertyOptional({ type: EntityInfoDto, nullable: true })
  @IsObject()
  entityInfo: EntityInfoDto | null;

  constructor(
    id: number,
    sessionId: string,
    callId: string,
    userId: number,
    numberId: number | null,
    entityId: number | null,
    direction: CallDirection,
    phoneNumber: string,
    duration: number | null,
    status: CallStatus | null,
    failureReason: string | null,
    recordUrl: string | null,
    comment: string | null,
    createdAt: string,
    entityInfo?: EntityInfoDto | null,
  ) {
    this.id = id;
    this.sessionId = sessionId;
    this.callId = callId;
    this.userId = userId;
    this.numberId = numberId;
    this.entityId = entityId;
    this.direction = direction;
    this.phoneNumber = phoneNumber;
    this.duration = duration;
    this.status = status;
    this.failureReason = failureReason;
    this.recordUrl = recordUrl;
    this.comment = comment;
    this.createdAt = createdAt;
    this.entityInfo = entityInfo;
  }
}
