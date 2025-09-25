import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

import { HttpMethod } from '@/common';
import { ActionsSettings } from '../../common';

export class ActionHttpCallSettings extends ActionsSettings {
  @ApiProperty({ description: 'External URL to call' })
  @IsString()
  url: string;

  @ApiProperty({ enum: HttpMethod, description: 'HTTP call method' })
  @IsEnum(HttpMethod)
  method: HttpMethod;

  @ApiPropertyOptional({ type: Object, nullable: true, description: 'Request headers' })
  @IsOptional()
  @IsObject()
  headers?: Record<string, string> | null;

  @ApiPropertyOptional({ type: Object, nullable: true, description: 'Request query params' })
  @IsOptional()
  @IsObject()
  params?: Record<string, string> | null;
}
